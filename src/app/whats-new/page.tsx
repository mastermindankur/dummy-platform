
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
                  <li><span className="text-foreground font-medium">Interactive Filtering:</span> The legend on the Executive Value Map is now clickable. You can filter the view to instantly highlight all items marked as <span className="text-foreground font-medium">"New"</span>, <span className="text-foreground font-medium">"Retired"</span>, or part of the <span className="text-foreground font-medium">"Book of Work 25"</span>.</li>
                  <li><span className="text-foreground font-medium">Traceability:</span> Selecting any item on the Value Map now highlights its entire <span className="text-foreground font-medium">upstream and downstream chain</span>, making it easy to trace connections from Levers to Outcomes.</li>
                  <li><span className="text-foreground font-medium">Last Updated Timestamp:</span> The Executive Value Map page now displays a <span className="text-foreground font-medium">"Last Updated"</span> timestamp, so you always know how current the data is.</li>
                  <li><span className="text-foreground font-medium">Help Dialog:</span> A new help icon provides a quick guide on how to read and interpret the value map, explaining the <span className="text-foreground font-medium">right-to-left flow</span> from Outcomes to Levers.</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Impact Showcase Section</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><span className="text-foreground font-medium">Impact Showcase Page:</span> A new <span className="text-foreground font-medium">"Impact Showcase"</span> page has been added to quantify and display the business value delivered by our key engineering initiatives.</li>
                  <li><span className="text-foreground font-medium">Categorized Initiatives:</span> Impact metrics are now grouped into three distinct categories: <span className="text-foreground font-medium">"Productivity & Efficiency Gains,"</span> <span className="text-foreground font-medium">"Quality & Reliability Improvement,"</span> and <span className="text-foreground font-medium">"Developer Engagement & Skill Uplift."</span></li>
                  <li><span className="text-foreground font-medium">Dynamic Data Management:</span> The "Update Data" page now includes a dedicated section to manage the initiatives displayed on the Impact Showcase, allowing for <span className="text-foreground font-medium">real-time additions and edits</span>.</li>
                  <li><span className="text-foreground font-medium">What's New Page:</span> This very page was created to provide a central place for you to see all the latest updates and improvements to the dashboard.</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
