"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/user-store";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { User, Mail, Phone, Globe, CreditCard, Bell } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, loadUser } = useUserStore();

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-gray-500">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <CardTitle>
                {user.firstName} {user.lastName}
              </CardTitle>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              defaultValue={user.firstName}
              icon={<User className="h-4 w-4" />}
              readOnly
            />
            <Input
              label="Last Name"
              defaultValue={user.lastName}
              icon={<User className="h-4 w-4" />}
              readOnly
            />
            <Input
              label="Email"
              defaultValue={user.email}
              icon={<Mail className="h-4 w-4" />}
              readOnly
            />
            <Input
              label="Phone"
              defaultValue={user.phone}
              icon={<Phone className="h-4 w-4" />}
              readOnly
            />
            <Input
              label="Nationality"
              defaultValue={user.nationality}
              icon={<Globe className="h-4 w-4" />}
              readOnly
            />
            <Input
              label="Date of Birth"
              defaultValue={user.dateOfBirth}
              type="date"
              readOnly
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Currency</p>
                  <p className="text-xs text-gray-500">Default currency for prices</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">{user.preferences.currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Language</p>
                  <p className="text-xs text-gray-500">Display language</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">English</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-500">Email and push notifications</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600">
                {user.preferences.notifications ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passport Info */}
      {user.passport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Travel Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Passport Number</p>
                <p className="text-sm font-medium text-gray-900">
                  ••••{user.passport.number.slice(-4)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expiry Date</p>
                <p className="text-sm font-medium text-gray-900">{user.passport.expiry}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Issuing Country</p>
                <p className="text-sm font-medium text-gray-900">{user.passport.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
