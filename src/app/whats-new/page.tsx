
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function WhatsNewPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">What's New in the Dashboard</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">A summary of recent features and improvements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center"><CheckCircle2 className="mr-3 h-6 w-6 text-green-500" />Value Map Enhancements</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><strong>Interactive Filtering:</strong> The legend on the Executive Value Map is now clickable. You can filter the view to instantly highlight all items marked as "New", "Retired", or part of the "Book of Work 25".</li>
                  <li><strong>Last Updated Timestamp:</strong> The Executive Value Map page now displays a "Last Updated" timestamp, so you always know how current the data is.</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center"><CheckCircle2 className="mr-3 h-6 w-6 text-green-500" />New Pages & Features</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><strong>Impact Showcase Page:</strong> A new "Impact Showcase" page has been added to quantify and display the business value delivered by our key engineering initiatives.</li>
                  <li><strong>What's New Page:</strong> This very page was created to provide a central place for you to see all the latest updates and improvements to the dashboard.</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
