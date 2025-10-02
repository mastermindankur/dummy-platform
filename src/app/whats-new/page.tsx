
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
                <h3 className="text-xl font-bold text-foreground">Value Map Enhancements</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><strong>Interactive Filtering:</strong> The legend on the Executive Value Map is now clickable. You can filter the view to instantly highlight all items marked as "New", "Retired", or part of the "Book of Work 25".</li>
                  <li><strong>Traceability:</strong> Selecting any item on the Value Map now highlights its entire upstream and downstream chain, making it easy to trace connections from Levers to Outcomes.</li>
                  <li><strong>Last Updated Timestamp:</strong> The Executive Value Map page now displays a "Last Updated" timestamp, so you always know how current the data is.</li>
                  <li><strong>Help Dialog:</strong> A new help icon provides a quick guide on how to read and interpret the value map, explaining the right-to-left flow from Outcomes to Levers.</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Impact Showcase Section</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><strong>Impact Showcase Page:</strong> A new "Impact Showcase" page has been added to quantify and display the business value delivered by our key engineering initiatives.</li>
                  <li><strong>Categorized Initiatives:</strong> Impact metrics are now grouped into three distinct categories: "Productivity & Efficiency Gains," "Quality & Reliability Improvement," and "Developer Engagement & Skill Uplift."</li>
                  <li><strong>Dynamic Data Management:</strong> The "Update Data" page now includes a dedicated section to manage the initiatives displayed on the Impact Showcase, allowing for real-time additions and edits.</li>
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
