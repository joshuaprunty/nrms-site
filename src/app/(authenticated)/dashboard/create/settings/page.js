import { Button } from "@/components/ui/button"
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function Create() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Quiz Settings</h1>
      <p className="mt-4">Set the quiz settings</p>
      <p className="mt-4">Setting one</p>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-4">Setting two</p>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
      <Button className="w-full max-w-7xl my-12">
        <Link href="/dashboard/create/edit">
          Next
        </Link>
      </Button>
    </div>
  )
}