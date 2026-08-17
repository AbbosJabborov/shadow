import { Link } from "react-router-dom"
import { CompassIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CompassIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you're looking for doesn't exist or may have been moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link to="/dashboard" />} nativeButton={false}>
            Back to Dashboard
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
