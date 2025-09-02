import {
  TrendingUp,
  ShieldCheck,
  Scaling,
  Cpu,
  Landmark,
} from "lucide-react";
import type { Pillar, Status } from "@/types";

export const pillars: Pillar[] = [
  {
    id: "improving-productivity",
    name: "Improving Productivity",
    description:
      "Enhancing engineering efficiency through better tools, processes, and workflows.",
    icon: TrendingUp,
    subItems: [
      {
        id: "dev-velocity",
        name: "Developer Velocity",
        status: "Green",
        description: "Cycle time from commit to production.",
        trend: "up",
        owner: "Engineering Team",
        lastUpdate: "2024-07-28",
        comments: "Recent improvements are showing positive results.",
        percentageComplete: 90,
      },
      {
        id: "ci-cd-pipeline",
        name: "CI/CD Pipeline Optimization",
        status: "Amber",
        description: "Efficiency and speed of the integration and deployment pipeline.",
        trend: "flat",
        owner: "DevOps Team",
        lastUpdate: "2024-07-27",
        comments: "Blocked by infrastructure upgrade.",
        percentageComplete: 60,
      },
      {
        id: "eng-docs",
        name: "Engineering Documentation",
        status: "Green",
        description: "Quality and availability of technical documentation.",
        trend: "up",
        owner: "Tech Writers",
        lastUpdate: "2024-07-29",
        comments: "New documentation portal launched.",
        percentageComplete: 85,
      },
    ],
  },
  {
    id: "building-reliable-products",
    name: "Building Reliable Products",
    description:
      "Ensuring products are robust, available, and performant.",
    icon: ShieldCheck,
    subItems: [
      {
        id: "uptime",
        name: "Service Level Uptime",
        status: "Green",
        description: "Availability of critical services, measured against SLOs.",
        trend: "up",
        owner: "SRE Team",
        lastUpdate: "2024-07-30",
        comments: "Exceeding SLO targets for 3 consecutive months.",
        percentageComplete: 99,
      },
      {
        id: "error-rate",
        name: "Production Error Rate",
        status: "Red",
        description: "Rate of unhandled errors and exceptions in production.",
        trend: "down",
        owner: "Backend Team",
        lastUpdate: "2024-07-29",
        comments: "Spike in errors after recent deployment. Actively investigating.",
        percentageComplete: 30,
      },
      {
        id: "perf-testing",
        name: "Performance Testing",
        status: "Amber",
        description: "Regularity and coverage of performance and load testing.",
        trend: "flat",
        owner: "QA Team",
        lastUpdate: "2024-07-26",
        comments: "Need to expand test coverage for new services.",
        percentageComplete: 50,
      },
    ],
  },
  {
    id: "making-design-resilient",
    name: "Making Design Resilient",
    description:
      "Creating scalable and fault-tolerant system architectures.",
    icon: Scaling,
    subItems: [
      {
        id: "system-scalability",
        name: "System Scalability",
        status: "Green",
        description: "Ability of systems to handle increased load.",
        trend: "up",
        owner: "Architecture Guild",
        lastUpdate: "2024-07-25",
        comments: "Load tests show we can handle 2x traffic.",
        percentageComplete: 95,
      },
      {
        id: "disaster-recovery",
        name: "Disaster Recovery Plan",
        status: "Green",
        description: "Effectiveness and testing of the disaster recovery strategy.",
        trend: "up",
        owner: "SRE Team",
        lastUpdate: "2024-07-22",
        comments: "Last DR drill was successful with zero data loss.",
        percentageComplete: 90,
      },
      {
        id: "dependency-management",
        name: "Dependency Management",
        status: "Amber",
        description: "Clarity and resilience of inter-service dependencies.",
        trend: "flat",
        owner: "Platform Team",
        lastUpdate: "2024-07-28",
        comments: "Service map needs updating.",
        percentageComplete: 65,
      },
    ],
  },
  {
    id: "adopting-emerging-technologies",
    name: "Adopting Emerging Tech",
    description:
      "Leveraging new technologies like AI and serverless to drive innovation.",
    icon: Cpu,
    subItems: [
      {
        id: "explore-resiliency-program",
        name: "Explore Resiliency Program",
        status: "Amber",
        description:
          "Explore Resiliency program to cover the Design & cloud adoption.",
        trend: "flat",
        owner: "Innovation Team",
        lastUpdate: "2024-07-28",
        comments: "Awaiting budget approval for new initiatives.",
        percentageComplete: 40,
      },
      {
        id: "hackathons",
        name: "Use Case Discovery (Hackathons)",
        status: "Green",
        description:
          "Discover new use cases through hackathons and innovation challenges.",
        trend: "up",
        owner: "DevRel",
        lastUpdate: "2024-07-20",
        comments: "Last hackathon produced 3 viable project ideas.",
        percentageComplete: 100,
      },
      {
        id: "industry-events",
        name: "Industry Events",
        status: "Amber",
        description:
          "Demonstrate DTI Emerging Tech in industry events to foster innovation.",
        trend: "flat",
        owner: "Marketing",
        lastUpdate: "2024-07-15",
        comments: "Upcoming conference in Q4.",
        percentageComplete: 70,
      },
      {
        id: "blogs-open-source",
        name: "Blogs and Open Source",
        status: "Green",
        description:
          "Publish blogs and contribute to open source to share knowledge.",
        trend: "up",
        owner: "Engineering Team",
        lastUpdate: "2024-07-29",
        comments: "New blog post on our open-source library was published.",
        percentageComplete: 80,
      },
      {
        id: "tech-sphere-sessions",
        name: "Tech Sphere Sessions",
        status: "Green",
        description:
          "Increase participation and audience coverage for Tech Sphere Sessions.",
        trend: "up",
        owner: "Internal Comms",
        lastUpdate: "2024-07-25",
        comments: "Record attendance at the last session.",
        percentageComplete: 100,
      },
      {
        id: "mentorship-program",
        name: "Mentorship Program",
        status: "Green",
        description:
          "Mentor & Mentee between Business and Technology.",
        trend: "up",
        owner: "HR",
        lastUpdate: "2024-07-22",
        comments: "Successfully matched 10 new pairs.",
        percentageComplete: 90,
      },
    ],
  },
  {
    id: "world-class-corporate-governance",
    name: "World Class Governance",
    description:
      "Upholding the highest standards of security, compliance, and process.",
    icon: Landmark,
    subItems: [
      {
        id: "security-compliance",
        name: "Security Compliance",
        status: "Green",
        description: "Adherence to industry security standards (e.g., SOC 2, ISO 27001).",
        trend: "up",
        owner: "Security Team",
        lastUpdate: "2024-07-30",
        comments: "SOC 2 Type II audit completed successfully.",
        percentageComplete: 100,
      },
      {
        id: "incident-management",
        name: "Incident Management Process",
        status: "Green",
        description: "Clarity and effectiveness of the on-call and incident response process.",
        trend: "up",
        owner: "SRE Team",
        lastUpdate: "2024-07-27",
        comments: "Mean Time to Resolution (MTTR) is down by 15%.",
        percentageComplete: 85,
      },
      {
        id: "access-control",
        name: "Access Control Policies",
        status: "Amber",
        description: "Regular review and audit of system access permissions.",
        trend: "flat",
        owner: "Security Team",
        lastUpdate: "2024-07-28",
        comments: "Quarterly access review is overdue.",
        percentageComplete: 50,
      },
    ],
  },
];

export function getPillarById(id: string) {
  return pillars.find((p) => p.id === id);
}

export function getPillarStatus(pillarId: string): Status {
  const pillar = getPillarById(pillarId);
  if (!pillar) return "Red";

  const statuses = pillar.subItems.map((item) => item.status);
  if (statuses.includes("Red")) return "Red";
  if (statuses.includes("Amber")) return "Amber";
  return "Green";
}
