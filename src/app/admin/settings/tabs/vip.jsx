"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";
import { usePost, useGet } from "@/hooks/useApi";

export default function VipPage() {
  const createVip = usePost("/api/admin/vip");
  const { data, refetch, isLoading } = useGet("/api/admin/vip");

  const vipList = data?.data || data || [];

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (formData) => {
    if (createVip.isPending) return;

    createVip.mutate(formData, {
      onSuccess: () => {
        reset();
        refetch();
      },
      onError: (err) => {
        console.error("VIP creation failed:", err);
      },
    });
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          VIP Management
        </h1>
        <p className="text-sm text-gray-500">
          Create and manage VIP levels
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-xl">
        <h2 className="text-lg font-semibold">Create VIP Level</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Level" type="number" {...register("level")} />
          <Input label="Name" {...register("name")} />
          <Input label="Min Total Profit" type="number" {...register("minTotalProfit")} />
          <Input label="Min Withdrawal" type="number" {...register("minWithdrawal")} />
          <Input label="Max Withdrawal" type="number" {...register("maxWithdrawal")} />
          <Input label="Daily Withdrawal Limit" type="number" {...register("dailyWithdrawalLimit")} />
          <Input label="Max Daily Withdrawals" type="number" {...register("maxDailyWithdrawals")} />
          <Input label="Bonus %" type="number" {...register("bonusPercentage")} />

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            disabled={createVip.isPending}
          >
            {createVip.isPending ? "Creating..." : "Create VIP Level"}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Existing VIP Levels</h2>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : vipList.length === 0 ? (
          <p className="text-gray-500">No VIP levels yet</p>
        ) : (
          <div className="space-y-3">
            {vipList.map((vip) => (
              <div
                key={vip._id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {vip.name} (Level {vip.level})
                  </p>
                  <p className="text-sm text-gray-500">
                    Min Profit: ${vip.minTotalProfit}
                  </p>
                  <p className="text-sm text-gray-500">
                    Withdrawal: ${vip.minWithdrawal} - ${vip.maxWithdrawal}
                  </p>
                  <p className="text-sm text-gray-500">
                    Daily Limit: ${vip.dailyWithdrawalLimit} | Max Count:{" "}
                    {vip.maxDailyWithdrawals}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useForm } from "react-hook-form";
// import { Input } from "@/components/ui/auth-input";
// import { Button } from "@/components/ui/button";
// import { usePost, useGet } from "@/hooks/useApi";

// export default function VipPage() {
//   const createVip = usePost("/api/admin/vip");
//   const { data, refetch, isLoading } = useGet("/api/admin/vip");

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm();

//   const onSubmit = (data) => {
//     createVip.mutate(data, {
//       onSuccess: () => {
//         reset();
//         refetch();
//       },
//       onError: (err) => {
//         console.error("VIP creation failed:", err);
//       },
//     });
//   };

//   return (
//     <div className="p-6 space-y-8">
//       {/* HEADER */}
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">
//           VIP Management
//         </h1>
//         <p className="text-sm text-gray-500">
//           Create and manage VIP levels
//         </p>
//       </div>

//       {/* CREATE VIP FORM */}
//       <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-xl">
//         <h2 className="text-lg font-semibold">Create VIP Level</h2>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <Input label="Level (number)" type="number" {...register("level")} />
//           <Input label="Name" {...register("name")} />
//           <Input label="Min Total Profit" type="number" {...register("minTotalProfit")} />

//           <Input label="Min Withdrawal" type="number" {...register("minWithdrawal")} />
//           <Input label="Max Withdrawal" type="number" {...register("maxWithdrawal")} />
//           <Input label="Daily Withdrawal Limit" type="number" {...register("dailyWithdrawalLimit")} />
//           <Input label="Max Daily Withdrawals" type="number" {...register("maxDailyWithdrawals")} />

//           <Input label="Bonus %" type="number" {...register("bonusPercentage")} />

//           <Button
//             type="submit"
//             className="w-full bg-blue-600 text-white hover:bg-blue-700"
//             disabled={createVip.isPending}
//           >
//             {createVip.isPending ? "Creating..." : "Create VIP Level"}
//           </Button>
//         </form>
//       </div>

//       {/* VIP LIST */}
//       <div className="bg-white p-6 rounded-xl shadow">
//         <h2 className="text-lg font-semibold mb-4">Existing VIP Levels</h2>

//         {isLoading ? (
//           <p className="text-gray-500">Loading...</p>
//         ) : data?.length === 0 ? (
//           <p className="text-gray-500">No VIP levels yet</p>
//         ) : (
//           <div className="space-y-3">
//             {data?.map((vip) => (
//               <div
//                 key={vip._id}
//                 className="border rounded-lg p-4 flex justify-between items-center"
//               >
//                 <div>
//                   <p className="font-semibold">
//                     {vip.name} (Level {vip.level})
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Min Profit: ${vip.minTotalProfit}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Withdrawal: ${vip.minWithdrawal} - ${vip.maxWithdrawal}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Daily Limit: ${vip.dailyWithdrawalLimit} | Max Count:{" "}
//                     {vip.maxDailyWithdrawals}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }