import { useEffect, useState } from 'react';
import { Player } from './Player';
import * as cheerio from 'cheerio';

export const App = () => {
  const [items, setItems] = useState<{ href: string; identifier: string }[]>(
    []
  ); // array of item identifiers

  const assets = '/assets';
  const [pkg, setPkg] = useState('items');

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    setPkg(selectedValue);
  };

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
  }, [pkg]);

  return (
    <>
      <div className="fixed left-3 top-3">
        <select
          className="block w-full mt-1 rounded-md shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          onChange={handleDropdownChange}
        >
          <option value="items">Custom</option>
          <option value="qti3-items">QTI3</option>
        </select>
      </div>
      <Player items={items} pkg={pkg} assets={assets}></Player>
    </>
  );
};
