
'use client';

import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, UserPlus } from "lucide-react";
import { useState, useEffect } from 'react';

export default function WhatsNewPage() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">What's New in the Dashboard</CardTitle>
              {currentDate && (
                <CardDescription className="text-md text-muted-foreground pt-1">
                  Last updated on {currentDate}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Value Map Enhancements</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><span className="text-foreground">Interactive Filtering:</span> The legend on the Executive Value Map is now clickable. You can filter the view to instantly highlight all items marked as <span className="text-foreground">"New"</span>, <span className="text-foreground">"Retired"</span>, or part of the <span className="text-foreground">"Book of Work 25"</span>.</li>
                  <li><span className="text-foreground">Traceability:</span> Selecting any item on the Value Map now highlights its entire <span className="text-foreground">upstream and downstream chain</span>, making it easy to trace connections from Levers to Outcomes.</li>
                  <li><span className="text-foreground">Last Updated Timestamp:</span> The Executive Value Map page now displays a <span className="text-foreground">"Last Updated"</span> timestamp, so you always know how current the data is.</li>
                  <li><span className="text-foreground">Help Dialog:</span> A new help icon provides a quick guide on how to read and interpret the value map, explaining the <span className="text-foreground">right-to-left flow</span> from Outcomes to Levers.</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Impact Showcase Section</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><span className="text-foreground">Impact Showcase Page:</span> A new <span className="text-foreground">"Impact Showcase"</span> page has been added to quantify and display the business value delivered by our key engineering initiatives.</li>
                  <li><span className="text-foreground">Categorized Initiatives:</span> Impact metrics are now grouped into three distinct categories: <span className="text-foreground">"Productivity & Efficiency Gains,"</span> <span className="text-foreground">"Quality & Reliability Improvement,"</span> and <span className="text-foreground">"Developer Engagement & Skill Uplift."</span></li>
                  <li><span className="text-foreground">Dynamic Data Management:</span> The "Update Data" page now includes a dedicated section to manage the initiatives displayed on the Impact Showcase, allowing for <span className="text-foreground">real-time additions and edits</span>.</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">Miscellaneous</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><span className="text-foreground">What's New Page:</span> This very page was created to provide a central place for you to see all the latest updates and improvements to the dashboard.</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">What's Coming Soon</CardTitle>
              <CardDescription>A look at the features and improvements on our roadmap.</CardDescription>
            </CardHeader>
            <CardContent>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><span className="text-foreground">Productivity Dashboard Completion:</span> The "Improving Productivity" dashboard will be finalized and rolled out.</li>
                  <li><span className="text-foreground">WCCG Dashboard Enhancements:</span> The "World Class Corporate Governance" dashboard will be enhanced to include awards and other relevant metrics.</li>
                  <li><span className="text-foreground">Integrated View:</span> Create a direct inter-relationship between the "Value Map" and the "WCE YTD Progress" dashboards for seamless navigation.</li>
                  <li><span className="text-foreground">Expanded Impact Metrics:</span> The "Impact Showcase" will support a wider variety of units of measurement for more flexible quantification of success.</li>
                  <li><span className="text-foreground">Linked-Up Impact:</span> Initiatives on the "Impact Showcase" will be linkable back to the "Value Map" and "WCE YTD Progress" to show direct connections.</li>
                  <li><span className="text-foreground">Personalized Action View:</span> A "person-wide" view will be added to the "Action Items & Status" page, allowing individuals to see all tasks assigned to them.</li>
                  <li><span className="text-foreground">LOBT-Specific Dashboards:</span> A new "LOBT-wide" view will allow different Lines of Business Technology to see a dashboard tailored to their specific data.</li>
                  <li><span className="text-foreground">Time-Based Progress Tracking:</span> Implement a time-series comparison feature to visualize how progress is made over different time scales.</li>
                </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <UserPlus className="h-8 w-8 text-accent" />
                <div>
                    <CardTitle className="text-2xl font-bold text-foreground">Join Our Team!</CardTitle>
                    <CardDescription>Help us shape the future of this dashboard.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">We are looking for passionate individuals to help build this dashboard further. The application is built with a modern tech stack, including Next.js (App Router), React (Server Components), TypeScript, ShadCN for UI components, and Tailwind CSS for styling. If you have skills in these areas and are interested in contributing, please reach out to the project lead.</p>
                <p className="text-muted-foreground">We are also looking for a <span className="text-foreground">Product person</span> to help enhance the user experience and understand the needs of our different users. If you have a knack for product management and a passion for creating great user-centric tools, we'd love to have you on board.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
