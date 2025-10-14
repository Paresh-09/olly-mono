import React from "react";
import { Control } from "react-hook-form";
import { FormValues } from "../page";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Switch } from "@repo/ui/components/ui/switch";
import { Textarea } from "@repo/ui/components/ui/textarea";

interface ProductPromotionProps {
  control: Control<FormValues>;
  watchPromoteProduct: boolean;
}

export default function ProductPromotion({
  control,
  watchPromoteProduct,
}: ProductPromotionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="promoteProduct"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
            <div className="space-y-0.5">
              <FormLabel>
                Promote Your Product
              </FormLabel>
              <FormDescription>
                Include product promotion in automated interactions.
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Product Details (conditional) */}
      {watchPromoteProduct && (
        <FormField
          control={control}
          name="productDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your product or service to be promoted..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide details about what you're promoting. This will be used to
                generate relevant comments.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}