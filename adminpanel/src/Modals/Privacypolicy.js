import React, { useState, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap'

import { getPrivacyPolicylists } from '../api/api';
import { sanitizeHtml } from '../lib/sanitizeHtml';

function Privacy() {
    const [privacy, setPrivacy] = useState("")

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }, []);
    useEffect(() => {
        FetchPrivacyPolicy()
    }, [])
    const FetchPrivacyPolicy = async () => {
        let resp = await getPrivacyPolicylists()
        console.log("rrrrrrrrrr", resp);
        if (resp) {
            setPrivacy(resp)

        }

    }
    return (
        <>
            <Container className='py-5'>

                <div className='non-auth__inner'>
                    <h4>Privacy Policy</h4>
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(privacy) }}></div>
                </div>

            </Container>
        </>
    )
}

export default Privacy