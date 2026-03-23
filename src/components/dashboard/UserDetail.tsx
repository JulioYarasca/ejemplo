/**
 * User Detail Component
 * Following Single Responsibility Principle - displays detailed user information
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
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  GraduationCap,
  MapPin,
  Heart,
  Clock,
  Mail,
} from "lucide-react";
import type { User } from "@/types";

interface UserDetailProps {
  readonly user: User;
  readonly onBack: () => void;
}

export function UserDetail({ user, onBack }: UserDetailProps) {
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
        return "Administrador";
      case "student":
        return "Estudiante";
      default:
        return role;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" className="mb-4">
        ← Volver al dashboard
      </Button>

      <Card className="max-w-2xl mx-auto shadow-xl py-0">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg py-4">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
            <AvatarFallback className="text-xl font-bold bg-white text-blue-600">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <CardDescription className="text-blue-100">
            @{user.username}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              className={`${getRoleColor(user.role)} flex items-center gap-1`}
            >
              {getRoleIcon(user.role)}
              {getRoleDisplayName(user.role)}
            </Badge>
            {user.age && (
              <span className="text-sm text-gray-600">{user.age} años</span>
            )}
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>

            {user.career && (
              <div className="flex items-center gap-2 text-gray-600">
                <GraduationCap className="w-4 h-4" />
                <span>{user.career}</span>
              </div>
            )}

            {user.section && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Sección {user.section}</span>
              </div>
            )}

            {user.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-700">{user.description}</p>
              </div>
            )}

            {user.hobbies && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Hobbies
                </h4>
                <p className="text-gray-700">{user.hobbies}</p>
              </div>
            )}

            {user.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Miembro desde {formatDate(user.createdAt)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
