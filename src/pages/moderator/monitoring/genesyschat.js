import React, { useEffect } from 'react';

 

export const GenesysChat = () => {

    const genesysUrl = 'https://apps.euw2.pure.cloud/genesys-bootstrap/genesys.min.js';

    const genesysConfig = {

        environment: 'prod-euw2',

        deploymentId: 'fca0caab-e08a-4efb-bf98-096e73254605'

    };

   

   

    function initializeWebchat(g, e, n, es, ys) {

        g['_genesysJs'] = e;

        g[e] = g[e] || function () {

            (g[e].q = g[e].q || []).push(arguments);

        };

        g[e].t = 1 * new Date();

        g[e].c = es;

        ys = document.createElement('script');

        ys.async = 1;

        ys.src = n;

        ys.charset = 'utf-8';

        document.head.appendChild(ys);

    }

 

    function TriggerChatWTW() {

        initializeWebchat(window, 'Genesys', genesysUrl, genesysConfig);

        if (window.Genesys) {

            window.Genesys("command", "Database.set", {

                messaging: {

                    customAttributes: {

                        bgroup: 'ABC',

                        referenceNumber: '000001'

                    }

                }

            });

        }

    }

    return {

        TriggerChatWTW

    }

}