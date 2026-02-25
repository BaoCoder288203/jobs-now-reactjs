import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/app/hooks";
import { Camera, Mail, Phone, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function UserInfoPage() {
  const { fullName: authFullName, email, phone: authPhone, avatar, role, userId } =
    useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (authFullName) setFullName(authFullName);
    if (authPhone) setPhone(authPhone);
  }, [authFullName, authPhone]);

  if (!userId) return null;

  const handleCancel = () => {
    setFullName(authFullName || "");
    setPhone(authPhone || "");
    setIsEditing(false);
  };

  const handleSave = () => {
    console.log("Save:", { fullName: fullName.trim(), phone: phone.trim() });
    setIsEditing(false);
  };

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
        </div>

        {/* Profile Card */}
        <Card className="border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="group relative inline-block">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-gray-200">
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
                <div
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-gray-300 bg-opacity-50 opacity-0 transition-opacity duration-200 group-hover:opacity-90"
                  onClick={() => {
                    console.log("Avatar upload clicked");
                  }}
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Họ và tên
                  </label>
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
                      <span className="text-gray-900">{authFullName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
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
                      <span className="text-gray-900">{authPhone || "—"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Vai trò
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                    <span className="text-gray-900">
                      {role?.replace("_", " ") || "User"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel}>
                      Hủy
                    </Button>
                    <Button onClick={handleSave}>Lưu</Button>
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