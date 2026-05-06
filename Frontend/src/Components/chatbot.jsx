import { useEffect } from "react";

export default function Wedghy () {
    useEffect(() => {
        const script = document.createElement("script");
        script.type = "module";
        script.defer = true;
        script.textContent = `
            import n8nChatUiWidget from 'https://proxy.n8nchatui.com/api/embed/40SBa9';
            n8nChatUiWidget.load();
        `;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <></>
    )
}
