/**
 * User Card Component
 * Following Single Responsibility Principle - displays user information in card format
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, GraduationCap, MapPin } from "lucide-react";
import type { User } from "@/types";

interface UserCardProps {
  readonly user: User;
  readonly onClick: () => void;
  readonly className?: string;
}

export function UserCard({ user, onClick, className = "" }: UserCardProps) {
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case "professor":
      case "teacher":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "professor":
      case "teacher":
        return <GraduationCap className="w-4 h-4" />;
      case "admin":
        return <UserIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case "professor":
      case "teacher":
        return "Profesor";
      case "admin":
        return "Admin";
      case "student":
        return "Estudiante";
      default:
        return role;
    }
  };

  return (
    <Card
      className={`hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white border-0 shadow-lg ${className}`}
      onClick={onClick}
    >
      <CardHeader className="text-center pb-4">
        <Avatar className="w-16 h-16 mx-auto mb-3 shadow-lg">
          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg leading-tight">{user.name}</CardTitle>
        <CardDescription className="text-sm">@{user.username}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <Badge
          className={`${getRoleColor(user.role)} w-full justify-center flex items-center gap-1`}
        >
          {getRoleIcon(user.role)}
          {getRoleDisplayName(user.role)}
        </Badge>

        <div className="space-y-2 text-sm text-gray-600">
          {user.career && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <span className="truncate">{user.career}</span>
            </div>
          )}

          {user.section && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>Sección {user.section}</span>
            </div>
          )}

          {user.age && (
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <span>{user.age} años</span>
            </div>
          )}
        </div>

        {user.description && (
          <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded">
            {user.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
