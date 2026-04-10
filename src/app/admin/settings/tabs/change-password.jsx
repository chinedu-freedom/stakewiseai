"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePost } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const postChangePassword = usePost("/api/admin/change-password");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (postChangePassword.isPending) return;

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    postChangePassword.mutate(
      {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      },
      {
        onSuccess: () => {
          setForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          toast.success("Password updated successfully");
        },
      }
    );
  };

  return (
    <div className="bg-white border rounded-md p-6 shadow-sm w-full md:w-1/2">
      <h2 className="text-base font-medium mb-1">Password</h2>
      <p className="text-sm text-muted-foreground mb-6">
        To keep your account secure, please update your password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Current password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
        />
        <Input
          type="password"
          placeholder="New password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
        />
        <Input
          type="password"
          placeholder="Confirm password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <div className="bg-muted/20 border rounded-md p-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">Rules for password:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Minimum 8 characters</li>
            <li>At least one special character</li>
            <li>At least one number</li>
            <li>At least one uppercase letter</li>
            <li>Cannot be the same as a previous password</li>
          </ul>
        </div>

        <Button
          type="submit"
          className="mt-4 bg-[#3C3CF6] text-white hover:bg-[#2e2ee6] min-w-[140px] flex items-center justify-center gap-2"
          disabled={postChangePassword.isPending}
        >
          {postChangePassword.isPending ? "Saving" : "Save Changes"}
          {postChangePassword.isPending && (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          )}
        </Button>
      </form>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { usePost } from "@/hooks/useApi";
// import { Loader2 } from "lucide-react";

// export default function ChangePassword() {
//   const [form, setForm] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const postChangePassword = usePost("/api/admin/change-password");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
//       toast.error("Please fill all fields");
//       return;
//     }
//     if (form.newPassword !== form.confirmPassword) {
//       toast.error("New passwords do not match");
//       return;
//     }

//     postChangePassword.mutate(
//       {
//         currentPassword: form.currentPassword,
//         newPassword: form.newPassword,
//       },
//       {
//         onSuccess: (res) => {
//           // Reset form fields
//           setForm({
//             currentPassword: "",
//             newPassword: "",
//             confirmPassword: "",
//           });
//         },
//       }
//     );
//   };

//   return (
//     <div className="bg-white border rounded-md p-6 shadow-sm w-full md:w-1/2">
//       <h2 className="text-base font-medium mb-1">Password</h2>
//       <p className="text-sm text-muted-foreground mb-6">
//         To keep your account secure, please update your password below.
//       </p>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Input
//           type="password"
//           placeholder="Current password"
//           name="currentPassword"
//           value={form.currentPassword}
//           onChange={handleChange}
//         />
//         <Input
//           type="password"
//           placeholder="New password"
//           name="newPassword"
//           value={form.newPassword}
//           onChange={handleChange}
//         />
//         <Input
//           type="password"
//           placeholder="Confirm password"
//           name="confirmPassword"
//           value={form.confirmPassword}
//           onChange={handleChange}
//         />

//         <div className="bg-muted/20 border rounded-md p-4 text-sm text-muted-foreground space-y-2">
//           <p className="font-medium text-foreground">Rules for password:</p>
//           <ul className="list-disc pl-5 space-y-1">
//             <li>Minimum 8 characters</li>
//             <li>At least one special character</li>
//             <li>At least one number</li>
//             <li>At least one uppercase letter</li>
//             <li>Cannot be the same as a previous password</li>
//           </ul>
//         </div>
//         <Button
//           type="submit"
//           className="mt-4 bg-[#3C3CF6] text-white hover:bg-[#2e2ee6] min-w-[140px] flex items-center justify-center gap-2"
//           disabled={postChangePassword.isPending}
//         >
//           {postChangePassword.isPending ? "Saving" : "Save Changes"}
//           {postChangePassword.isPending && (
//             <Loader2 className="w-5 h-5 animate-spin text-white" />
//           )}
//         </Button>
//       </form>
//     </div>
//   );
// }
