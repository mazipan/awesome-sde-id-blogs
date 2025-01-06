import { readFileSync, writeFileSync } from 'node:fs';

const REGEX = /^\+ \[(.+)\]\((http.+)\)/gi;
const REGEX_NAME = /\[.+\]/;
const REGEX_LINK = /\(http.+\)/;
const REGEX_REPLACER = new RegExp('\\[|\\]|\\(|\\)', 'gi');

function getTypeOfLink(link) {
  if (link.includes('github.com')) {
    return 'github';
  } else if (link.includes('x.com')) {
    return 'x';
  }

  return 'unknown';
}

function extractUsername(link) {
  const allLinksPart = link.split('/');
  return allLinksPart[allLinksPart.length - 1];
}

async function parse() {
  let result = [];
  const fileContent = readFileSync('./README.md', { encoding: 'utf-8' });

  for (let line of fileContent.split('\n')) {
    const match = line.match(REGEX);
    if (match) {
      const markdown = match[0].replace('+ ', '');
      const splitBy = markdown.split('by');

      const blogMarkdown = splitBy[0].trim();
      const matchBlogName = blogMarkdown.match(REGEX_NAME);
      const matchBlogLink = blogMarkdown.match(REGEX_LINK);

      const ownerMarkdown = splitBy[1].trim();
      const matchOwnerName = ownerMarkdown.match(REGEX_NAME);
      const matchOwnerLink = ownerMarkdown.match(REGEX_LINK);
      const link = matchOwnerLink[0].replace(REGEX_REPLACER, '');
      const typeOfLink = getTypeOfLink(link);
      const uname = extractUsername(link);

      result.push({
        blog: {
          name: matchBlogName[0].replace(REGEX_REPLACER, ''),
          link: matchBlogLink[0].replace(REGEX_REPLACER, ''),
        },
        owner: {
          name: matchOwnerName[0].replace(REGEX_REPLACER, ''),
          link: link,
          icon: typeOfLink,
          avatar: `https://unavatar.io/${typeOfLink}/${uname}`,
        },
      });
    }
  }

  const json = {
    data: result,
    metadata: {
      total: result.length,
      updatedAt: new Date().toISOString(),
      source: 'https://github.com/mazipan/awesome-sde-id-blogs',
    },
  };

  writeFileSync('./generated/data.json', JSON.stringify(json, false, 2));
  writeFileSync(
    './generated/data.js',
    `export const awesomeSdeBlogs = ${JSON.stringify(json, false, 2)}`
  );

  writeFileSync(
    './generated/data.ts',
    `
type BlogItem = {
  name: string
  link: string
}

type Owner = {
  name: string
  link: string
  icon: 'github' | 'x' | 'unknown'
  avatar: string
}

type DataItem = {
  blog: BlogItem
  owner: Owner
}

type Metadata = {
  total: number
  updatedAt: string
  source: string
}

export type AwesomeSdeBlogs = {
  data: DataItem[]
  metadata: Metadata
};

export const awesomeSdeBlogs: AwesomeSdeBlogs = ${JSON.stringify(
      json,
      false,
      2
    )}`
  );
}

// IIFE
(async () => {
  await parse();
})();
