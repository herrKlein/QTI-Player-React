import { useEffect, useRef, useState } from 'react';
import { QtiItem } from "@citolab/qti-components/react/qti-item";
import { qtiTransform } from "@citolab/qti-components/qti-transform";
import { ResponseInteraction } from '@citolab/qti-components';

export const Player = ({items}:{items:{ href: string; identifier: string }[]}) => {
  const server = '/';
  const pkg = 'assets';
  const [itemIndex, setItemIndex] = useState<number>(0); // the index of the current item
  const [itemXML, setItemXML] = useState<string>(''); // the xml of the current item
  const [itemId, setItemId] = useState<string | undefined>(undefined); // the identifier set by the connected, triggers setting the response
  const itemResponses = useRef(new Map<string, ResponseInteraction[]>([]));

  useEffect(() => {
    const fetchItem = async () => {
      const xmlFetch = await fetch(`${server}${pkg}/items/${items[itemIndex]?.href}`);
      const xmlString = await xmlFetch.text();
      const xml = qtiTransform(xmlString)
        .assetsLocation(`${server}${pkg}/items/`, ["src", "href", "data"])
        .pciHooks(`${server}${pkg}/items/`).xml();
      setItemXML(xml);
    }
    fetchItem().catch(console.error);
  }, [items, itemIndex]);

  const storeResponse = (itemId: string, response: string | string[], responseIdentifier: string): void => {
    const itemdata = itemResponses.current.get(itemId) || [];
    const iteminteraction = itemResponses.current.get(itemId)?.find(val => val.responseIdentifier === responseIdentifier);
    if (iteminteraction) iteminteraction.response = response;
    else itemResponses.current.set(itemId, [...itemdata, { response, responseIdentifier }]);
  };
  const onNext = () => {
    itemIndex < items.length - 1 && setItemIndex(itemIndex + 1)
  }

  return (
    <div className="w-screen h-screen bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
      <QtiItem
      
        className="w-[800px] h-[600px] bg-white shadow p-4"
        responses={itemId && itemResponses.current.get(itemId)}
        qtiinteractionchanged={({ detail }:{detail: any}) => storeResponse(detail.item, detail.response, detail.responseIdentifier)}
        qtioutcomechanged={(e: any) => console.log(e)}
        qtiitemconnected={(e: any) => setItemId(e.detail.identifier)}
        xml={itemXML}
      />
      <div className="flex">
        <button onClick={() => itemIndex > 0 && setItemIndex(itemIndex - 1)}>vorige</button>
        <button onClick={onNext}>volgende</button>
      </div>
    </div>
  )
}

