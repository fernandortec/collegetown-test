import { readFile } from "node:fs/promises";
import path from "node:path";

import { chromium, type Page } from "playwright";
import { describe, expect, it } from "vitest";

import type { StaffRecord } from "../school.types";
import { getStaffGeorgiaCurrent, getStaffGeorgiaSnapshot } from "./georgia";
import { cleanText, cleanTitle, extractGenericStaffRecords, normalizeStaffRecords } from "./scraper-utils";
import { getStaffVirginiaTechCurrent, getStaffVirginiaTechSnapshot } from "./virginia-tech";
import { getStaffWittenbergCurrent, getStaffWittenbergSnapshot } from "./wittenberg";

type Scraper = (page: Page) => Promise<StaffRecord[]> | StaffRecord[];

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

async function withPage<T>(html: string, action: (page: Page) => Promise<T>): Promise<T> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.setContent(html);
    return await action(page);
  } finally {
    await browser.close();
  }
}

describe("school scrapers", () => {
  for (const testCase of cases) {
    it(testCase.name, async () => {
      const content = await readFile(path.join(sampleDir, testCase.sample), "utf8");
      const actual = await withPage(content, (page) => Promise.resolve(testCase.scraper(page)));

      expect(actual).toHaveLength(testCase.expected.length);
      expect(actual).toEqual(testCase.expected);
    });
  }

  it("extracts Wittenberg rows with lowercase data-title name", async () => {
    await expect(
      withPage(
        `
          <table>
            <tr>
              <td data-title="name"><a href="/information/directory/bios/alex-stone">Alex Stone</a></td>
              <td data-title="Title">Associate Athletics Director</td>
              <td data-title="Email"><a href="mailto:astone@wittenberg.edu">Email</a></td>
              <td data-title="Phone">937-555-1234</td>
            </tr>
          </table>
        `,
        getStaffWittenbergCurrent,
      ),
    ).resolves.toEqual([
      {
        name: "Alex Stone",
        title: "Associate Athletics Director",
        email: "astone@wittenberg.edu",
        phone: "937-555-1234",
      },
    ]);
  });

  it("extracts Wittenberg sibling cells from bio links", async () => {
    await expect(
      withPage(
        `
          <table>
            <tr>
              <td><a href="/information/directory/bios/jordan-hale">Jordan Hale</a></td>
              <td data-title="Title">Director of Athletics Communications</td>
              <td data-title="Email"><a href="mailto:jhale@wittenberg.edu">Email</a></td>
              <td data-title="Phone">937-555-5678</td>
            </tr>
          </table>
        `,
        getStaffWittenbergSnapshot,
      ),
    ).resolves.toEqual([
      {
        name: "Jordan Hale",
        title: "Director of Athletics Communications",
        email: "jhale@wittenberg.edu",
        phone: "937-555-5678",
      },
    ]);
  });

  it("extracts generic fallback table layout", async () => {
    await expect(
      withPage(`
        <table>
          <tr><th>Name</th><th>Title</th><th>Email</th><th>Phone</th></tr>
          <tr>
            <td data-title="Name">Alex Stone</td>
            <td data-title="Title">Associate Athletics Director</td>
            <td data-title="Email"><a href="mailto:astone@example.edu">Email</a></td>
            <td data-title="Phone"><a href="tel:555-123-4567">555-123-4567</a></td>
          </tr>
        </table>
      `, extractGenericStaffRecords),
    ).resolves.toEqual([
      {
        name: "Alex Stone",
        title: "Associate Athletics Director",
        email: "astone@example.edu",
        phone: "555-123-4567",
      },
    ]);
  });

  it("extracts generic fallback card layout", async () => {
    await expect(
      withPage(`
        <section class="profile-card">
          <h3>Jordan Hale</h3>
          <p class="position">Director of Athletics Communications</p>
          <a href="mailto:jhale@example.edu">jhale@example.edu</a>
        </section>
      `, extractGenericStaffRecords),
    ).resolves.toEqual([
      {
        name: "Jordan Hale",
        title: "Director of Athletics Communications",
        email: "jhale@example.edu",
      },
    ]);
  });

  it("extracts generic fallback text layout", async () => {
    await expect(
      withPage(`
        <main>
          Taylor Reed
          Assistant Coach
          treed@example.edu
          555-987-6543
        </main>
      `, extractGenericStaffRecords),
    ).resolves.toEqual([
      {
        name: "Taylor Reed",
        title: "Assistant Coach",
        email: "treed@example.edu",
        phone: "555-987-6543",
      },
    ]);
  });

  it("preserves Title IX titles", () => {
    expect(cleanTitle("Title IX Coordinator")).toBe("Title IX Coordinator");
    expect(cleanText("Title IX Coordinator")).toBe("Title IX Coordinator");
  });

  it("normalizes records without owning deduplication", () => {
    expect(
      normalizeStaffRecords([
        {
          name: "Gary Bennett, Ph.D.",
          title: "Senior Associate Athletics Director, Clinical and Sport Psychologist",
          email: "GABENNET@VT.EDU",
          phone: "(540) 449-4597",
        },
        {
          name: "Gary Bennett, Ph.D.",
          title: "Senior Associate Athletics Director, Clinical and Sport Psychologist",
          email: "gabennet@vt.edu",
          phone: "540-449-4597",
        },
      ]),
    ).toEqual([
      {
        name: "Gary Bennett, Ph.D.",
        title: "Senior Associate Athletics Director, Clinical and Sport Psychologist",
        email: "gabennet@vt.edu",
        phone: "(540) 449-4597",
      },
      {
        name: "Gary Bennett, Ph.D.",
        title: "Senior Associate Athletics Director, Clinical and Sport Psychologist",
        email: "gabennet@vt.edu",
        phone: "540-449-4597",
      },
    ]);
  });

  it("handles internationalized names in generic fallback text", async () => {
    await expect(
      withPage(
        `
          <main>
            María de la Cruz
            Associate Athletics Director
            mcruz@example.edu
            555-987-6543

            Renée O’Connell
            Staff Counselor
            roconnell@example.edu
          </main>
        `,
        extractGenericStaffRecords,
      ),
    ).resolves.toEqual([
      {
        name: "María de la Cruz",
        title: "Associate Athletics Director",
        email: "mcruz@example.edu",
        phone: "555-987-6543",
      },
      {
        name: "Renée O’Connell",
        title: "Staff Counselor",
        email: "roconnell@example.edu",
      },
    ]);
  });
});
