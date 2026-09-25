import Swal from "sweetalert2";

export async function showSuccess(
  title: string,
  text?: string,
): Promise<void> {
  await Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#c2410c",
    background: "#fffaf5",
    color: "#2a1a10",
  });
}

export async function showError(
  title: string,
  text?: string,
): Promise<void> {
  await Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#9f1239",
    background: "#fffaf5",
    color: "#2a1a10",
  });
}

export async function showWarning(
  title: string,
  text?: string,
): Promise<void> {
  await Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#c2410c",
    background: "#fffaf5",
    color: "#2a1a10",
  });
}

export async function confirmAction(
  title: string,
  text: string,
  confirmText = "Yes, continue",
): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    confirmButtonColor: "#c2410c",
    cancelButtonColor: "#57534e",
    reverseButtons: true,
    background: "#fffaf5",
    color: "#2a1a10",
  });

  return result.isConfirmed;
}

export function toast(
  icon: "success" | "warning" | "error",
  title: string,
): void {
  void Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });
}
