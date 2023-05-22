import React, { useEffect, useRef, useState } from 'react';
import { QtiItem } from "@citolab/qti-components/react/qti-item";
import { qtiTransform } from "@citolab/qti-components/qti-transform";
import { InteractionChangedDetails, ResponseInteraction } from '@citolab/qti-components';

export const Player = ({ server, pkg }: { server: string, pkg: string }) => {
  const uri = `${server}/${pkg}`;
  const url = `/assets/items/items.json`;

  const [items, setItems] = useState<{ href: string; identifier: string }[]>([]); // array of item identifiers
  const [itemsXML, setItemsXML] = useState<string[]>([]); // the xml of all items
  const [itemIndex, setItemIndex] = useState<number | null>(null); // the index of the current item
  const itemResponses = new Map<string, ResponseInteraction[]>([]);

  const assessmentItemRef = useRef<typeof QtiItem>();

  useEffect(() => {
    let myItems: any;
    const fetchData = async () => {
      const data = await fetch(url);
      const json = await data.json();
      myItems = json;
      setItems(json);
    }

    // call the function
    fetchData().then(async (e) => {
      const fetchItems = myItems.map(async (item: any) => {
        const xmlFetch = await fetch(`${server}${pkg}/items/${item.href}`);
        return xmlFetch.text();
      });
      await Promise.all(fetchItems).then((itemsXML) => {
        const xml = itemsXML.map((xml) =>
          qtiTransform(xml).assetsLocation(`${server}${pkg}/items/`, ["src", "href", "data"]).pciHooks(`${server}${pkg}/items/`).xml()
        );
        setItemsXML(xml);
      });
      setItemIndex(0);
    }).catch(console.error);
  }, []);

  const storeResponse = (itemId: string, response:string | string[], responseIdentifier:string): void => {
    const itemdata = itemResponses.get(itemId) || [];
    const iteminteraction = itemdata.find((val) => val.responseIdentifier === responseIdentifier);
    if (iteminteraction) {
      iteminteraction.response = response; // update item
    } else {
      itemResponses.set(itemId, [...itemdata, {response, responseIdentifier}]); // add new item
    }
  };

  const getResponse = (itemId: string): ResponseInteraction[] | null => {
    const response = itemResponses.get(itemId);
    return response ? response : [];
  };

  const currentItemResponse = (itemIndex: number | null): ResponseInteraction[] => {
    if (!itemIndex || itemIndex ==0 || !items || items.length == 0) return []
     
    const hasResponse = getResponse(items[itemIndex].identifier)
    if (hasResponse) return hasResponse
    return [];

  } 

  return (
    <div className="w-screen h-screen bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
      <QtiItem
        className="w-[800px] h-[600px] bg-white shadow p-4"
        ref={assessmentItemRef}
        // responses={currentItemResponse(itemIndex)}
        qtiinteractionchanged={({detail}) => storeResponse(detail.item, detail.response, detail.responseIdentifier) }
        qtioutcomechanged={(e) => console.log(e)}
        xml={itemIndex ? itemsXML[itemIndex] : ''}
      />
      <div className="flex">
        <button onClick={() => itemIndex && itemIndex > 0 && setItemIndex(itemIndex - 1)}>vorige</button>
        <button onClick={() => itemIndex && itemIndex < items.length && setItemIndex(itemIndex + 1)}>volgende</button>
      </div>
    </div>
  )
}

      {/* ${unsafeHTML(itemsXML[itemIndex])} */}

  // const item = items[itemIndex];
// fetch(`${server}/response/replay/${item.href}?identifier=${item.identifier}`, {
//   method: "POST",
//   body: JSON.stringify(e.detail),
//   headers: {
//     "Content-type": "application/json; charset=UTF-8",
//   },
// });

// const [itemXML, setItemXML] = useState(null); // the xml of the current item
// useEffect(async () => {
//   const itemsFetched = await fetch(url);
//   const items = await itemsFetched.json();
//   setItems(items);
//   setItemIndex(0)
// }, []);

// useEffect(async () => {
//   if (itemIndex==undefined) return;
//   const item = items[itemIndex];

//   const xmlFetch = await fetch(`${uri}/${item.href}`);
//   const xmlText = await xmlFetch.text();

//   const xml = transformQTI(xmlText)
//     .assetsLocation(`${uri}/`,['src', 'href'])
//     .xml();

//   setItemXML(xml);
// }, [itemIndex])


