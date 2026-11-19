import { island } from "@/components/island";
import { Mascot } from "@/components/mascot";
import { StoreBadges } from "@/components/store-badges";
import { StoreRedirect } from "@/components/store-redirect";

/** The download QR code's target for what the server can't place: an iPad, which reports itself as a Mac, goes to its
    store; anything else picks a badge. */
function GetPage() {
  return (
    <section className="shell grid min-h-[80svh] place-items-center pb-20 pt-32 text-center">
      <StoreRedirect />
      <div>
        <Mascot mood="wave" outfit="school" decorative className="mx-auto w-40" />
        <h1 className="mt-8 text-headline">Get Tavis.</h1>
        <p className="mt-4 text-lede text-muted">Free on iPhone and Android.</p>
        <StoreBadges className="mt-9 justify-center" />
      </div>
    </section>
  );
}

export default island(GetPage);
