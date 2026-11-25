import React from 'react'

const Layout = () => {
    return (
        <div>
             <Container fluid className="common_bg position-relative">
                <div className="liner"></div>
                <Row>
                    <Col xl={2} lg={0} className='p-0 d-none d-xl-block'>
                        <Sidebar />
                    </Col>
                    <Col xl={10} lg={12}>
                        <Header title={'Hobbies'} />
                        </Col>
                </Row>
            </Container >
        </div>
    )
}

export default Layout