import { useEffect, useState } from 'react';
import { Player } from './Player';
import * as cheerio from 'cheerio';

export const App = () => {
  const [items, setItems] = useState<{ href: string; identifier: string }[]>(
    []
  ); // array of item identifiers

  const assets = '/assets';
  const pkg = 'qti3-items';

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(`${assets}/${pkg}/imsmanifest.xml`);
      const xml = await data.text();

      const $ = cheerio.load(xml);

      const resources: { href: string; identifier: string }[] = [];
      $('resource').each((_, element) => {
        const identifier = $(element).attr('identifier')!;
        const href = $(element).attr('href')!;

        resources.push({ identifier, href });
      });

      setItems(resources);
    };
    fetchData().catch(console.error);
  }, []);

  return <Player items={items} pkg={pkg} assets={assets}></Player>;
};
