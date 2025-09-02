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
      },
      {
        id: "ci-cd-pipeline",
        name: "CI/CD Pipeline Optimization",
        status: "Amber",
        description: "Efficiency and speed of the integration and deployment pipeline.",
      },
      {
        id: "eng-docs",
        name: "Engineering Documentation",
        status: "Green",
        description: "Quality and availability of technical documentation.",
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
      },
      {
        id: "error-rate",
        name: "Production Error Rate",
        status: "Red",
        description: "Rate of unhandled errors and exceptions in production.",
      },
      {
        id: "perf-testing",
        name: "Performance Testing",
        status: "Amber",
        description: "Regularity and coverage of performance and load testing.",
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
      },
      {
        id: "disaster-recovery",
        name: "Disaster Recovery Plan",
        status: "Green",
        description: "Effectiveness and testing of the disaster recovery strategy.",
      },
      {
        id: "dependency-management",
        name: "Dependency Management",
        status: "Amber",
        description: "Clarity and resilience of inter-service dependencies.",
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
      },
      {
        id: "hackathons",
        name: "Use Case Discovery (Hackathons)",
        status: "Green",
        description:
          "Discover new use cases through hackathons and innovation challenges.",
      },
      {
        id: "industry-events",
        name: "Industry Events",
        status: "Amber",
        description:
          "Demonstrate DTI Emerging Tech in industry events to foster innovation.",
      },
      {
        id: "blogs-open-source",
        name: "Blogs and Open Source",
        status: "Green",
        description:
          "Publish blogs and contribute to open source to share knowledge.",
      },
      {
        id: "tech-sphere-sessions",
        name: "Tech Sphere Sessions",
        status: "Green",
        description:
          "Increase participation and audience coverage for Tech Sphere Sessions.",
      },
      {
        id: "mentorship-program",
        name: "Mentorship Program",
        status: "Green",
        description:
          "Mentor & Mentee between Business and Technology.",
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
      },
      {
        id: "incident-management",
        name: "Incident Management Process",
        status: "Green",
        description: "Clarity and effectiveness of the on-call and incident response process.",
      },
      {
        id: "access-control",
        name: "Access Control Policies",
        status: "Amber",
        description: "Regular review and audit of system access permissions.",
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
