import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { StaffRecord } from "../school.types";
import { getStaffGeorgiaCurrent, getStaffGeorgiaSnapshot } from "./georgia";
import { getStaffVirginiaTechCurrent, getStaffVirginiaTechSnapshot } from "./virginia-tech";
import { getStaffWittenbergCurrent, getStaffWittenbergSnapshot } from "./wittenberg";

type Scraper = (html: string) => Promise<StaffRecord[]> | StaffRecord[];

const sampleDir = path.resolve(process.cwd(), "../../samples");

const cases: Array<{
  name: string;
  sample: string;
  scraper: Scraper;
  expected: StaffRecord[];
}> = [
  {
    name: "Georgia current",
    sample: "georgia-current.md",
    scraper: getStaffGeorgiaCurrent,
    expected: [
      {
        name: "Josh Brooks",
        title: "J. Reid Parker Director of Athletics",
        phone: "706-542-9037",
      },
      {
        name: "Darrice Griffin",
        title: "Senior Deputy Director of Athletics",
      },
    ],
  },
  {
    name: "Georgia Wayback",
    sample: "georgia-wayback.md",
    scraper: getStaffGeorgiaSnapshot,
    expected: [
      {
        name: "Darrice Griffin",
        title: "Senior Deputy Director of Athletics",
        phone: "706-542-9103",
        email: "dgriffin@sports.uga.edu",
      },
    ],
  },
  {
    name: "VT current",
    sample: "virginia-current.md",
    scraper: getStaffVirginiaTechCurrent,
    expected: [
      {
        name: "Clint Wattenberg",
        title: "Associate Athletics Director / Sports Nutrition",
        email: "clintwattenberg@vt.edu",
        phone: "231-9910",
      },
      {
        name: "Savannah Gustafson, MS, RD",
        title: "Director of Basketball Sports Nutrition",
        email: "savannahgus@vt.edu",
      },
      {
        name: "Austin Mark",
        title: "Director of Football Sports Nutrition",
        email: "augmark@vt.edu",
      },
      {
        name: "Molly Miller, MS, RD",
        title: "Assistant Director of Sports Nutrition",
        email: "mollymiller@vt.edu",
      },
      {
        name: "Gary Bennett, Ph.D.",
        title: "Senior Associate Athletics Director, Clinical and Sport Psychologist",
        email: "gabennet@vt.edu",
        phone: "(540) 449-4597",
      },
      {
        name: "Shelbi Fisher, Ph.D.",
        title: "Licensed Clinical and Sport Psychologist",
        email: "shelbif@vt.edu",
      },
      {
        name: "Lauren Naldo",
        title: "Staff Counselor",
        email: "kellarl@vt.edu",
      },
      {
        name: "Jim Reinhard",
        title: "Staff Counselor",
        email: "jreinh@vt.edu",
        phone: "(540) 494-0811",
      },
    ],
  },
  {
    name: "VT Wayback",
    sample: "virginia-wayback.md",
    scraper: getStaffVirginiaTechSnapshot,
    expected: [
      {
        name: "Whit Babcock",
        title: "Director of Athletics",
        phone: "231-3977",
        email: "hokiead@vt.edu",
      },
      {
        name: "John Ballein",
        title: "Executive Associate Athletic Director",
        phone: "231-3357",
        email: "jballein@vt.edu",
      },
    ],
  },
  {
    name: "Wittenberg current",
    sample: "wittenberg-current.md",
    scraper: getStaffWittenbergCurrent,
    expected: [
      {
        name: "Brian Agler",
        title: "Vice President and Director of Athletics & Recreation",
        phone: "937-327-6472",
        email: "aglerb1@wittenberg.edu",
      },
      {
        name: "Brad Beals",
        title: "Assistant DIrector of Athletics for Operations",
        phone: "937-327-6458",
        email: "bealsb@wittenberg.edu",
      },
      {
        name: "Katie Robinson",
        title: "Assistant Director of Athletics for Internal Operations",
        phone: "937-327-6496",
        email: "robinsonk6@wittenberg.edu",
      },
      {
        name: "Jay Owen",
        title: "Assistant Director of Athletics for Internal Operations & Compliance",
        phone: "937-327-6451",
        email: "owenj@wittenberg.edu",
      },
      {
        name: "Melissa Kolbe",
        title: "Senior Woman Administrator",
        phone: "937-327-7074",
        email: "kolbem@wittenberg.edu",
      },
      {
        name: "Ryan Maurer",
        title: "Associate Director of Athletics for Communications, Web Strategy & Content",
        phone: "937-327-6114",
        email: "rmaurer@wittenberg.edu",
      },
      {
        name: "Ryan Forbush",
        title: "Director of Athletics Facilities & Events",
        phone: "937-327-7095",
        email: "forbushr@wittenberg.edu",
      },
      {
        name: "Brayden Tosi",
        title: "Athletics Administration GA",
        email: "tosib@wittenberg.edu",
      },
      {
        name: "JJ McCann",
        title: "Athletics Administration GA",
        email: "mccannj@wittenberg.edu",
      },
      {
        name: "Olivia Campbell",
        title: "Athletics Administration GA",
        email: "campbello@wittenberg.edu",
      },
    ],
  },
  {
    name: "Wittenberg Wayback",
    sample: "wittenberg-wayback.md",
    scraper: getStaffWittenbergSnapshot,
    expected: [
      {
        name: "Brian Agler",
        title: "Vice President and Director of Athletics & Recreation",
        email: "aglerb1@wittenberg.edu",
      },
      {
        name: "Bret Billhardt",
        title: "Senior Associate Director of Athletics Operations/Compliance",
        phone: "937-327-7088",
        email: "billhardtb@wittenberg.edu",
      },
      {
        name: "Deb Howard",
        title: "Assistant Director Facilities/Events & Club Sports",
        phone: "937-327-6493",
        email: "howardd2@wittenberg.edu",
      },
      {
        name: "Katie Robinson",
        title: "Head Coach & Senior Woman Administrator",
        phone: "937-327-6496",
        email: "robinsonk6@wittenberg.edu",
      },
      {
        name: "Ian Jump",
        title: "Graduate Assistant",
      },
      {
        name: "Praacnaa Colestock",
        title: "Administrative Assistant",
        phone: "937-327-6458",
        email: "colestockp@wittenberg.edu",
      },
      {
        name: "AJ Meyer",
        title: "Director of Athletic Communication",
        phone: "937-327-6471",
        email: "meyera@wittenberg.edu",
      },
    ],
  },
];

async function main(): Promise<void> {
  for (const testCase of cases) {
    const content = await readFile(path.join(sampleDir, testCase.sample), "utf8");
    const actual = await testCase.scraper(content);

    assert.equal(
      actual.length,
      testCase.expected.length,
      `${testCase.name} count`,
    );

    assert.deepEqual(actual, testCase.expected, testCase.name);
    console.log(`✓ ${testCase.name}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
