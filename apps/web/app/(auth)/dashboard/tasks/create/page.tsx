import { validateRequest } from "@/lib/auth";
import { CreateTaskForm } from "../_components/CreateTaskForm";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";

export default async function NewTaskPage() {
  const session = await validateRequest();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const license = await prismadb.userLicenseKey.findFirst({
    where: {
      userId: session.user.id,
      licenseKey: {
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      }
    },
    include: {
      licenseKey: {
        select: {
          key: true,
          tier: true,
          expiresAt: true
        }
      }
    }
  });
  
  const licenseKey = license?.licenseKey?.key;



  if (!licenseKey) {
    redirect('/dashboard');
  }

  return (
    <CreateTaskForm 
      userId={session.user.id} 
      licenseKey={licenseKey}
    />
  );
}



