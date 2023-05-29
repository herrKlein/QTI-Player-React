import { useEffect, useRef, useState } from 'react';
import { QtiItem } from '@citolab/qti-components/react/qti-item';
import { qtiTransform } from '@citolab/qti-components/qti-transform';
import { ResponseInteraction } from '@citolab/qti-components';
export const Player = ({
  items,
}: {
  items: { href: string; identifier: string }[];
}) => {
  const server = '/';
  const pkg = 'assets';
  const [itemIndex, setItemIndex] = useState<number>(0); // the index of the current item
  const [itemXML, setItemXML] = useState<string>(''); // the xml of the current item
  const [itemId, setItemId] = useState<string | undefined>(undefined); // the identifier set by the connected, triggers setting the response
  const itemResponses = useRef(new Map<string, ResponseInteraction[]>([]));

  useEffect(() => {
    const fetchItem = async () => {
      const xmlFetch = await fetch(
        `${server}${pkg}/items/${items[itemIndex]?.href}`
      );
      const xmlString = await xmlFetch.text();
      const xml = qtiTransform(xmlString)
        .assetsLocation(`${server}${pkg}/items/`, ['src', 'href', 'data'])
        .pciHooks(`${server}${pkg}/items/`)
        .xml();
      setItemXML(xml);
    };
    fetchItem().catch(console.error);
  }, [items, itemIndex]);

  const storeResponse = (
    itemId: string,
    response: string | string[],
    responseIdentifier: string
  ): void => {
    const itemdata = itemResponses.current.get(itemId) || [];
    const iteminteraction = itemResponses.current
      .get(itemId)
      ?.find((val) => val.responseIdentifier === responseIdentifier);
    if (iteminteraction) iteminteraction.response = response;
    else
      itemResponses.current.set(itemId, [
        ...itemdata,
        { response, responseIdentifier },
      ]);
  };
  const onNext = () => {
    itemIndex < items.length - 1 && setItemIndex(itemIndex + 1);
  };

  return (
    <div className="w-screen h-screen px-8 bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
      <QtiItem
        scale-to-fit
        className="w-full h-[480px] bg-white shadow p-4"
        responses={itemId && itemResponses.current.get(itemId)}
        qtiinteractionchanged={({ detail }: { detail: any }) =>
          storeResponse(detail.item, detail.response, detail.responseIdentifier)
        }
        qtioutcomechanged={(e: any) => console.log(e)}
        qtiitemconnected={(e: any) => setItemId(e.detail.identifier)}
        xml={itemXML}
      />
      <div className="flex justify-between items-center w-full py-2">
        <button
          className="bg-blue-200 text-blue-900 rounded px-3 py-2 rounded"
          onClick={() => itemIndex > 0 && setItemIndex(itemIndex - 1)}
        >
          vorige
        </button>
        <div className="flex-1 mx-4 relative">
          <input
            type="range"
            value={itemIndex}
            className="appearance-none bg-transparent [&::-webkit-slider-runnable-track]:rounded-full absolute w-full"
            max={items.length - 1}
            onInput={(e) => setItemIndex(+(e.target as HTMLInputElement).value)}
          />
          <div className="flex justify-between">
            {items.map((_) => (
              <div className="w-4 h-4 rounded-full border-2 border-blue-400"></div>
            ))}
          </div>
        </div>
        <button
          className="bg-blue-200 text-blue-900 rounded px-3 py-2 rounded"
          onClick={onNext}
        >
          volgende
        </button>
      </div>
    </div>
  );
};
