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
  const itemOutcomes = useRef(new Map<string, number>([]));
  const qtiItem = useRef();

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
    (qtiItem.current! as typeof QtiItem).processResponse();
    itemIndex < items.length - 1 && setItemIndex(itemIndex + 1);
  };

  return (
    <div className="w-screen h-screen px-8 bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
      <QtiItem
        in-shadow-root
        className="w-full h-[480px] bg-white shadow p-4"
        responses={itemId && itemResponses.current.get(itemId)}
        qtiinteractionchanged={({ detail }: { detail: any }) =>
          storeResponse(detail.item, detail.response, detail.responseIdentifier)
        }
        qtioutcomechanged={(e: any) => {
          itemOutcomes.current.set(items[itemIndex].identifier, e.detail.value);
        }}
        qtiitemconnected={(e: any) => {
          qtiItem.current = e.target;
          setItemId(e.detail.identifier);
        }}
        dangerouslySetInnerHTML={{ __html: itemXML }}
      />

      <div className="flex justify-between items-center w-full py-2">
        <button
          className="bg-blue-500 text-white rounded px-3 pb-1 rounded text-3xl py-0"
          onClick={() => itemIndex > 0 && setItemIndex(itemIndex - 1)}
        >
          ‹
        </button>
        <div className="flex-1 mx-4 relative">
          <input
            type="range"
            value={itemIndex}
            className="appearance-none bg-transparent  absolute w-full"
            max={items.length - 1}
            onInput={(e) => setItemIndex(+(e.target as HTMLInputElement).value)}
          />
          <div className="flex justify-between">
            {items.map((item, i) => (
              <div
                key={item.identifier}
                className="w-4 h-4 rounded-full border-2 border-blue-400"
              >
                {itemOutcomes.current.get(items[i].identifier)}
              </div>
            ))}
          </div>
        </div>
        <button
          className="bg-blue-500 text-white rounded px-3 pb-1 rounded text-3xl py-0"
          onClick={onNext}
        >
          ›
        </button>
      </div>
      <h1>{itemId}</h1>
    </div>
  );
};
