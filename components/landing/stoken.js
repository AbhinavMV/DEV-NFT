import React from 'react';
import { useEffect, useState } from 'react'


function SToken() {

    // Faq section data
    const faqs = [
        {
            question: 'Question 1',
            answer:
                'You boil the hell out of it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.',
        },
        {
            question: 'Question 2',
            answer:
                'You boil the hell out of it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.',
        },
        // More questions...
    ]


    return (
        <>
            {/* S-TOKEN */}
            <div className="bg-background">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <div className="text-center justify-center item-center object-center">
                        <img
                            className="h-24 w-auto sm:h-48 mx-auto my-8"
                            src="/section-media.png"
                            alt=""
                        />
                        <h3 className="mt-1 text-4xl font-extrabold text-main sm:text-5xl sm:tracking-tight lg:text-6xl">
                            S-TOKEN
                        </h3>
                        <p className="max-w-xl mt-5 mx-auto text-xl text-text">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque aliquam est sit amet quam dignissim varius. Fusce sit amet quam nec.
                        </p>
                    </div>
                </div>
            </div>

        </>
    )
}


export default SToken;