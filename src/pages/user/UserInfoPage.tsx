import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppSelector } from "@/app/hooks";
import { Camera, Mail, Phone, User as UserIcon, MapPin, Calendar, Crown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useProfile, useUpdateProfile } from "@/modules/profile/hooks";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProfileAvatar } from "@/services/profile-cv.service";
import { getCandidateSubscriptionStatus } from "@/services/subscription-plan.service";
import type { ApiError } from "@/types";

export default function UserInfoPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId != null ? String(user.userId) : "";

  const { data: profile } = useProfile(userId);
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const authFullName = user?.fullName || null;
  const email = user?.email || null;
  const authPhone = user?.phone || null;
  const avatar = profile?.avatarUrl || user?.avatar || null;
  const role = user?.role || null;

  const [isEditing, setIsEditing] = useState(false);
  const [isVipUser, setIsVipUser] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");

  const avatarUpload = useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.profileId) {
        throw new Error("Không tìm thấy hồ sơ để cập nhật ảnh đại diện.");
      }
      await uploadProfileAvatar(profile.profileId, file);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Đã cập nhật ảnh đại diện");
    },
  });

  useEffect(() => {
    setFullName(profile?.fullName ?? authFullName ?? "");
    setPhone(profile?.phone ?? authPhone ?? "");
  }, [profile?.fullName, profile?.phone, authFullName, authPhone]);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? "");
      setAddress(profile.address ?? "");
      setDob(profile.dob ? profile.dob.slice(0, 10) : "");
    }
  }, [profile]);

  useEffect(() => {
    let mounted = true;
    if (role !== "ROLE_JOBSEEKER") {
      setIsVipUser(false);
      return () => {
        mounted = false;
      };
    }

    getCandidateSubscriptionStatus()
      .then((status) => {
        if (mounted) {
          setIsVipUser(Boolean(status.isProfileHighlighted));
        }
      })
      .catch(() => {
        if (mounted) {
          setIsVipUser(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [role]);

  if (!user) return null;

  const handleCancel = () => {
    setFullName(profile?.fullName ?? authFullName ?? "");
    setPhone(profile?.phone ?? authPhone ?? "");
    setBio(profile?.bio ?? "");
    setAddress(profile?.address ?? "");
    setDob(profile?.dob ? profile.dob.slice(0, 10) : "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile?.profileId) {
      toast.error("Không tìm thấy hồ sơ để lưu thông tin.");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        userId,
        profileId: profile.profileId,
        data: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          address: address.trim(),
          dob: dob || undefined,
        },
      });
      toast.success("Đã lưu thông tin");
      setIsEditing(false);
    } catch (error) {
      const message = (error as ApiError | Error)?.message || "Lưu thất bại. Vui lòng thử lại.";
      toast.error(message);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }

    try {
      await avatarUpload.mutateAsync(file);
    } catch (error) {
      const message = (error as ApiError | Error)?.message || "Cập nhật ảnh đại diện thất bại.";
      toast.error(message);
    }
  };

  useHotkey("Mod+S", (e) => {
    e.preventDefault();
    if (isEditing) handleSave();
  }, { enabled: isEditing });

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen p-6">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Thông tin người dùng
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin cá nhân và tài khoản của bạn
          </p>
          {isVipUser && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              <Crown className="h-4 w-4" />
              Tài khoản VIP
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card className="border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="group relative inline-block">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
                <div className={`relative h-32 w-32 overflow-hidden rounded-full border-4 ${isVipUser ? "border-amber-300 shadow-[0_0_0_4px_rgba(251,191,36,0.18)]" : "border-gray-200"}`}>
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={authFullName || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-2xl font-bold text-white">
                      {getUserInitials(authFullName || "U")}
                    </div>
                  )}
                </div>
                {isVipUser && (
                  <div className="absolute -right-1 -top-1 rounded-full border border-amber-300 bg-amber-100 p-1.5 text-amber-700 shadow-sm">
                    <Crown className="h-4 w-4" />
                  </div>
                )}
                <div
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-gray-300 bg-opacity-50 opacity-0 transition-opacity duration-200 group-hover:opacity-90"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Họ và tên */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Họ và tên</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 shrink-0 text-gray-400" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Họ và tên"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profile?.fullName || authFullName || "—"}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{email}</span>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Số điện thoại</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 shrink-0 text-gray-400" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Số điện thoại"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profile?.phone || authPhone || "—"}</span>
                    </div>
                  )}
                </div>

                {/* Vai trò */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Vai trò</Label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                    <span className="text-gray-900">
                      {role?.replace("_", " ") || "User"}
                    </span>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Địa chỉ</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Địa chỉ"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profile?.address || "—"}</span>
                    </div>
                  )}
                </div>

                {/* Ngày sinh */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Ngày sinh</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 shrink-0 text-gray-400" />
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">
                        {profile?.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "—"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-1.5">
                    Giới thiệu bản thân
                  </span>
                </Label>
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 min-h-[80px]">
                    <span className="text-gray-900 whitespace-pre-wrap">
                      {profile?.bio || <span className="text-gray-400 italic">Chưa có thông tin</span>}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel} disabled={updateProfile.isPending}>
                      Hủy
                    </Button>
                    <Button onClick={handleSave} disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? "Đang lưu..." : "Lưu"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
