import Image from "next/image";

const assets = [
    { name: "Logo Icon", src: "/assets/logo_icon_1764213956677.png" },
    { name: "Logo Horizontal", src: "/assets/logo_horizontal_1764214154899.png" },
    { name: "Banner Instagram", src: "/assets/banner_instagram_1764214258635.png" },
    { name: "Banner Story", src: "/assets/banner_story_1764214283853.png" },
    { name: "Banner Facebook", src: "/assets/banner_facebook_1764214335052.png" },
    { name: "Screenshot 1", src: "/assets/screenshot_1_1764214412791.png" },
    { name: "Screenshot 2", src: "/assets/screenshot_2_1764214433130.png" },
];

export default function StyleGuide() {
    return (
        <div className="min-h-screen bg-brand-gray p-8 font-inter text-brand-black">
            <h1 className="mb-8 font-montserrat text-4xl font-bold">FitChef IA - Style Guide</h1>

            <section className="mb-12">
                <h2 className="mb-4 font-poppins text-2xl font-semibold">Colors</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div className="space-y-2">
                        <div className="h-24 w-full rounded-lg bg-brand-yellow shadow-md"></div>
                        <p className="font-mono text-sm">Brand Yellow #FFB300</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 w-full rounded-lg bg-brand-yellow-light shadow-md"></div>
                        <p className="font-mono text-sm">Yellow Light #FFD967</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 w-full rounded-lg bg-brand-black shadow-md"></div>
                        <p className="font-mono text-sm">Brand Black #0B0B0B</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 w-full rounded-lg border border-gray-200 bg-white shadow-md"></div>
                        <p className="font-mono text-sm">White #FFFFFF</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-24 w-full rounded-lg border border-gray-200 bg-brand-gray shadow-md"></div>
                        <p className="font-mono text-sm">Brand Gray #F5F5F5</p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 font-poppins text-2xl font-semibold">Typography</h2>
                <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
                    <div>
                        <h1 className="font-montserrat text-5xl font-bold">Heading 1 (Montserrat)</h1>
                        <p className="text-sm text-gray-500">Montserrat Bold 48px</p>
                    </div>
                    <div>
                        <h2 className="font-poppins text-4xl font-bold">Heading 2 (Poppins)</h2>
                        <p className="text-sm text-gray-500">Poppins Bold 36px</p>
                    </div>
                    <div>
                        <h3 className="font-montserrat text-3xl font-semibold">Heading 3 (Montserrat)</h3>
                        <p className="text-sm text-gray-500">Montserrat Semibold 30px</p>
                    </div>
                    <div>
                        <p className="font-inter text-base leading-relaxed">
                            Body text (Inter). Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p className="text-sm text-gray-500">Inter Regular 16px</p>
                    </div>
                    <div>
                        <p className="font-roboto text-base leading-relaxed">
                            Alternative Body text (Roboto). Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
                        </p>
                        <p className="text-sm text-gray-500">Roboto Regular 16px</p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 font-poppins text-2xl font-semibold">Buttons</h2>
                <div className="flex flex-wrap gap-4 rounded-xl bg-white p-6 shadow-sm">
                    <button className="rounded-full bg-brand-yellow px-8 py-3 font-montserrat font-semibold text-brand-black transition hover:bg-brand-yellow-light">
                        Primary Button
                    </button>
                    <button className="rounded-full bg-brand-black px-8 py-3 font-montserrat font-semibold text-white transition hover:bg-gray-800">
                        Secondary Button
                    </button>
                    <button className="rounded-full border-2 border-brand-black px-8 py-3 font-montserrat font-semibold text-brand-black transition hover:bg-brand-gray">
                        Outline Button
                    </button>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 font-poppins text-2xl font-semibold">Generated Assets</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {assets.map((asset) => (
                        <div key={asset.name} className="rounded-xl bg-white p-4 shadow-sm">
                            <h3 className="mb-2 font-semibold">{asset.name}</h3>
                            <div className="relative aspect-auto w-full overflow-hidden rounded-lg bg-gray-100">
                                <Image
                                    src={asset.src}
                                    alt={asset.name}
                                    width={500}
                                    height={500}
                                    className="h-auto w-full object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
