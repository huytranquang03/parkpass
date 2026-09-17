import { useParams } from "react-router";

export default function AttractionDetailPage() {
  const params = useParams();
  return (
    <section>
      <h1>Chi tiết trải nghiệm</h1>
      <p>ID hiện tại: {params.id}</p>
    </section>
  );
}
