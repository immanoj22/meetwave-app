import React from 'react'

function SubscriptionCard({data}) {
    console.log(data,"datadata");
  return (
    <>
    
    <div className='subscription_card rounded-3'>
        <div className={` p-3 rounded-2 ${data.price <=10 ? 'subscription_card_blueHead' : 'subscription_card_greenHead'}`}>
            <p className='subsciption_title text-center'>{data.price <= 10 ? 'Premium' : 'Standard'}</p>
        </div>
        <div className='subscriptioc_card_body py-3 px-4 '>
            <p className='subsciption_price_days text-center mb-3'>${data.price}/<small>{data.days}days</small></p>
<div className='d-flex flex-column align-items-center'>
            <ul>
                {data.contents.map((item) =>
                <li className='mb-2 d-flex gap-2'>
                    <img src={data.price <=10 ? data.blueCheck.default : data.greenCheck.default} className='img-fluid subscript_checkers' />
                {item.title}</li> )}
            </ul>
            </div>

            <button className={`subsciption_green_gradBtn w-100 rounded-2 mt-4 ${data.price <= 10 ? 'subsciption_blue_gradBtn' :'subsciption_green_gradBtn'}`}>Learn more</button>
        </div>
    </div>

    </>
  )
}

export default SubscriptionCard