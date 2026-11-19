import { FloatingChat } from "@/components/floating-chat";
import { island } from "@/components/island";
import { Footer } from "@/components/v2/footer";
import { Header } from "@/components/v2/header";

/** BA's chrome: B's header and footer, and the WhatsApp button in B's ledge style. */
export const BaHeader = island(function BaHeader() {
  return <Header design="ba" />;
});
export const BaFooter = island(function BaFooter() {
  return <Footer design="ba" />;
});
export const BaChat = island(function BaChat() {
  return <FloatingChat look="ledge" />;
});
