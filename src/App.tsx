import { useEffect, useState } from "react";
import { Player } from "./Player";

export const App = () => {
    const [items, setItems] = useState<{ href: string; identifier: string }[]>([]); // array of item identifiers

    useEffect(() => {
        const fetchData = async () => {
          const data = await fetch('/assets/items/items.json');
          const json = await data.json();
          setItems(json);
        }
        fetchData().catch(console.error);
      }, []);
      
    return(<Player items={items}></Player>)
}


