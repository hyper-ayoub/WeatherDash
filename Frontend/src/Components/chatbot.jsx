import React from "react";
import { useState, useEffect } from "react";
import {Helmet} from "react-helmet";

export default function Wedghy () {
    return (
        <>
        {/*chatbot */}
        <Helmet>
        <script type="module" defer>
            import n8nChatUiWidget from 'https://proxy.n8nchatui.com/api/embed/40SBa9';
            n8nChatUiWidget.load();
        </script>
        </Helmet>
        </>
    )
}
