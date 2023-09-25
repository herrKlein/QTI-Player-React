import { useEffect, useRef, useState } from 'react';
import { QtiItem } from '@citolab/qti-components/react/qti-item';
import { QtiAssessmentItem, type ResponseInteraction } from '@citolab/qti-components';

export const Player = ({
  items, assets, pkg
}: {
  items: { href: string; identifier: string }[], assets: string, pkg: string
}) => {
  const server = `${assets}`;
  const [itemIndex, setItemIndex] = useState<number>(0); // the index of the current item
  const [itemXML, setItemXML] = useState<string>(''); // the xml of the current item
  const itemResponses = useRef(new Map<string, ResponseInteraction[]>([]));
  const itemOutcomes = useRef(new Map<string, number>([]));
  const qtiAssessmentItem = useRef<QtiAssessmentItem>();

  useEffect(() => {
    if (items.length == 0) return;
    const fetchItem = async () => {
      const xmlFetch = await fetch(
        `${server}/${pkg}/${items[itemIndex]?.href}`
      );
      const xml = await xmlFetch.text();

      setItemXML(xml);
    };
    fetchItem().catch(console.error);
  }, [items, itemIndex, pkg]);

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
    qtiAssessmentItem.current?.processResponse();
    itemIndex < items.length - 1 && setItemIndex(itemIndex + 1);
  };

  return (
    <div className="w-screen h-screen px-8 bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
      <QtiItem
        item-location={`${server}/${pkg}/`}
        className="w-full h-[480px] bg-white shadow p-4"
        qti-interaction-changed={({ detail }: { detail: any }) => {
          storeResponse(detail.item, detail.response, detail.responseIdentifier)
        }}
        qti-outcome-changed={(e: any) => {
          itemOutcomes.current.set(items[itemIndex].identifier, e.detail.value);
        }}
        qti-item-connected={({ detail: item }) => {
          qtiAssessmentItem.current = item;
          item.responses = itemResponses.current.get(item.identifier)!
        }}
        xml={itemXML}
      />
      <div className="flex justify-between items-center w-full py-2">
        <button
          className="bg-blue-500 text-white rounded px-3 pb-1 text-3xl py-0"
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
                className={`w-4 h-4 rounded-full border-2 border-blue-400 
                  ${itemOutcomes.current.get(items[i].identifier) == 0 ? 'bg-red-500' : ''}
                  ${itemOutcomes.current.get(items[i].identifier) == 1 ? 'bg-green-500' : ''}
                `}
              >
              </div>
            ))}
          </div>
        </div>
        <button
          className="bg-blue-500 text-white rounded px-3 pb-1 text-3xl py-0"
          onClick={onNext}
        >
          ›
        </button>
      </div>
    </div>
  );
};
