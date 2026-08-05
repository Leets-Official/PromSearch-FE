"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadProfileImage, deleteProfileImage } from "@/features/profile-image/api/image";

export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });
}

export function useDeleteProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });
}
