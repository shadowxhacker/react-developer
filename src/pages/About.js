import React, { useEffect } from 'react'

function About() {

    useEffect(() => {
        document.title = 'Agency - About Us';
    }, []);
  return (
    <>
     <section class="pt-10 overflow-hidden bg-gray-50 dark:bg-gray-800 md:pt-0 sm:pt-16 2xl:pt-16">
    <div class="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div class="grid items-center grid-cols-1 md:grid-cols-2">

            <div>
                <h2 class="text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl lg:text-5xl">Hey 👋 I
                    am
                    <br class="block sm:hidden" />Taha Ale
                </h2>
                <p class="max-w-lg mt-3 text-xl leading-relaxed text-gray-600 dark:text-gray-300 md:mt-8">
                Boosting brands with high-converting websites and standout logos. Let's grow your online presence!
                </p>

                <p class="mt-4 text-xl text-gray-600 dark:text-gray-300 md:mt-8">
                    <span class="relative inline-block">
                        <span class="absolute inline-block w-full bottom-0.5 h-2 bg-yellow-300 dark:bg-gray-600/45"></span>
                    <span class="relative"> Have a question? </span>
                    </span>
                    <br class="block sm:hidden" />Ask me on <a href="https://www.instagram.com/taha._.al3/" title="" target='_blank'
                        class="transition-all duration-200 text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-500 hover:underline">Instagram</a>
                </p>
            </div>

            <div class="relative">
                <img class="absolute inset-x-0 bottom-0 -mb-48 -translate-x-1/2 left-1/2" src="https://cdn.rareblocks.xyz/collection/celebration/images/team/1/blob-shape.svg" alt="" />

                <img class="relative w-[340px] sm:w-[327.2px] xl:max-w-lg xl:mx-auto 2xl:origin-bottom 2xl:scale-110" src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhwzuRBoGX9k0J0dtuP4csM9dKxQaGBI_tYLzw71bVPsb_cD2Cf3xGKdw6zkxNv9pvwJfOA0zoU2bZEAUHikq69aPdQ1kWjg1ZjQAinuUxUdIoKWv0kHpjCZvdpjjQX-ad_Z0ejYoczRY3pDbU_lGPNstj_KhWjVtCiXEbT0Jicfo16MXxl2mVsnRxI315r/s320/65ac0524491f3ab5ace9ed4dd054325b-removebg-preview.png" alt="" />
            </div>

        </div>
    </div>
</section>
    </>
  )
}

export default About
