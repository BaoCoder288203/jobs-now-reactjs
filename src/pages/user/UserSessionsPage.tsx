import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Clock } from "lucide-react";

export default function UserSessionsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Bảo mật</h1>
          <p className="text-gray-600">
            Quản lý mật khẩu và các phiên đăng nhập của bạn
          </p>
        </div>

        {/* Change Password */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Đổi mật khẩu để bảo vệ tài khoản của bạn
            </p>
            <Button>Đổi mật khẩu</Button>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Phiên đăng nhập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn
            </p>
            {/* Session list will be implemented later */}
            <div className="rounded-lg border border-gray-200 p-4 text-center text-gray-500">
              <p>Chức năng này sẽ được triển khai trong tương lai</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

