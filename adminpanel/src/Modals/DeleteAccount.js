import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';

function DeleteAccount() {
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }, []);

    return (
        <>
            <Container className='py-5'>
                <div className='non-auth__inner'>
                    <h4>Delete Your Account</h4>

                    <p>
                        If you wish to permanently delete your account and personal data from the <strong>Meetwave</strong> app, please follow the steps below:
                    </p>

                    <ol>
                        <li>
                            <strong>Open the App</strong>
                            <p>Launch the <strong>Meetwave</strong> app on your mobile device.</p>
                        </li>

                        <li>
                            <strong>Access Your Profile Settings</strong>
                            <ul>
                                <li>Select <em>Your Profile</em>.</li>
                                <li>Navigate to <em>App Settings</em>.</li>
                            </ul>
                        </li>

                        <li>
                            <strong>Begin the Deletion Process</strong>
                            <ul>
                                <li><strong>Click</strong> Delete Account and Personal information</li>

                                <li>You will see a prompt explaining that your data will be permanently deleted.</li>
                                <li>Check the confirmation box or tap <em>I agree</em> to proceed.</li>
                            </ul>
                        </li>

                        <li>
                            <strong>Verify with OTP (One-Time Password)</strong>
                            <ul>
                                <li>An OTP will be sent to your registered email address.</li>
                                <li>Enter the OTP in the app to verify your identity.</li>
                                <li>After successful verification, tap <em>Delete Your Account</em>.</li>
                            </ul>
                        </li>
                    </ol>

                    <p>
                        Once confirmed, your account and all associated personal information will be permanently removed from our servers.
                        Your profile will also be deleted from the admin panel to ensure complete removal from our system.
                    </p>
                </div>
            </Container>
        </>
    );
}

export default DeleteAccount;
