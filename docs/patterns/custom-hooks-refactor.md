# Custom hooks refactor: before and after

Tài liệu này lưu lại các pattern đã dùng trước khi tách thành custom hooks. Đây là tài liệu học tập, không phải source code được ứng dụng import.

Git history vẫn là nơi xem lại phiên bản đầy đủ. Chỉ giữ những đoạn ngắn giúp so sánh trách nhiệm trước và sau refactor.

## 1. Keyboard shortcut

### Before: component tự quản lý event listener

```tsx
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    const target = event.target;

    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLElement && target.isContentEditable);

    if (event.key !== "/" || isTyping) {
      return;
    }

    event.preventDefault();
    searchInputRef.current?.focus();
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);
```

Component phải tự đăng ký listener và cleanup. Phần logic này sẽ bị lặp nếu trang khác cũng có keyboard shortcut.

### After: hook quản lý vòng đời listener

```tsx
useKeyboardShortcut("/", (event) => {
  const target = event.target;

  const isTyping =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable);

  if (isTyping) {
    return;
  }

  event.preventDefault();
  searchInputRef.current?.focus();
});
```

Hook chịu trách nhiệm với listener; component chỉ giữ quy tắc riêng của trang là không chuyển focus khi user đang nhập liệu.

## 2. Attraction detail request

### Before: trang tự quản lý toàn bộ request lifecycle

```tsx
const [attraction, setAttraction] = useState<Attraction | null>(null);
const [status, setStatus] = useState<
  "loading" | "success" | "error" | "not-found"
>("loading");
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!id) {
    return;
  }

  const controller = new AbortController();

  async function loadAttraction() {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/attractions/${id}`, {
        signal: controller.signal,
      });

      if (response.status === 404) {
        setStatus("not-found");
        return;
      }

      if (!response.ok) {
        throw new Error("Không tải được thông tin trải nghiệm");
      }

      const result: Attraction = await response.json();
      setAttraction(result);
      setStatus("success");
    } catch {
      if (controller.signal.aborted) {
        return;
      }

      setError("Không tải được thông tin trải nghiệm");
      setStatus("error");
    }
  }

  void loadAttraction();

  return () => {
    controller.abort();
  };
}, [id]);
```

Trang phải tự quản lý loading, data, error, hủy request và race condition.

### After: trang sử dụng kết quả của `useFetch`

```tsx
const {
  status,
  data: attraction,
  error,
  responseStatus,
  refetch,
} = useFetch<Attraction>(attractionUrl);

const isNotFound = status === "error" && responseStatus === 404;
```

Trang chỉ còn quyết định UI nào cần hiển thị. Request lifecycle và AbortController nằm trong hook.

## 3. Attraction list and parks requests

### Before: một effect thực hiện hai request

```tsx
useEffect(() => {
  if (searchText !== debouncedSearchText) {
    return;
  }

  const controller = new AbortController();

  async function loadAttractions() {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const apiParams = new URLSearchParams(searchParams);

      apiParams.set("q", debouncedSearchText);
      apiParams.set("page", String(currentPage));
      apiParams.set("limit", String(PAGE_SIZE));

      const response = await fetch(
        `${baseUrl}/attractions?${apiParams.toString()}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error("Không tải được danh sách");
      }

      const result: AttractionListResponse = await response.json();

      const parksResponse = await fetch(`${baseUrl}/parks`, {
        signal: controller.signal,
      });

      if (!parksResponse.ok) {
        throw new Error("Không tải được danh sách khu vui chơi");
      }

      const parksResult: Park[] = await parksResponse.json();

      setTotal(result.total);
      setAttractions(result.data);
      setParks(parksResult);
      setStatus("success");
    } catch {
      if (controller.signal.aborted) {
        return;
      }

      setError("Không tải được danh sách");
      setStatus("error");
    }
  }

  void loadAttractions();

  return () => {
    controller.abort();
  };
}, [searchParams, debouncedSearchText, searchText, currentPage, retryCount]);
```

Hai tài nguyên độc lập bị gắn vào cùng một lifecycle: thay filter attractions cũng tải lại parks, và một request lỗi làm mất thông tin request nào thất bại.

### After: mỗi tài nguyên có một hook riêng

```tsx
const parksQuery = useFetch<Park[]>(parksUrl);
const attractionsQuery = useFetch<AttractionListResponse>(attractionsUrl);
```

Mỗi URL có loading, data, error và refetch riêng. Component kết hợp hai status để quyết định trạng thái chung của trang.

## Kết luận

- Custom hook loại bỏ logic lifecycle bị lặp, không loại bỏ logic nghiệp vụ riêng của component.
- Cleanup vẫn tồn tại; nó chỉ được chuyển từ page vào hook.
- URL phải ổn định theo đúng dependency mong muốn. Với search, URL attractions dùng giá trị đã debounce.
- Không phải effect nào cũng cần biến thành custom hook. Effect lightbox và toast vẫn thuộc hành vi riêng của trang chi tiết.

## Phụ lục: `AttractionCard` trước khi dùng compound component

```tsx
<article className={styles.card}>
  <img
    className={styles.image}
    src={attraction.images[0]}
    alt={attraction.name}
  />
  <Badge>{attraction.category}</Badge>
  <h2>
    <Link to={`/attractions/${attraction.id}`}>{attraction.name}</Link>
  </h2>
  <p>{parkName}</p>
  <p className={styles.price}>Từ {formattedPrice}</p>
  <p>Đánh giá: {attraction.rating}/5</p>
</article>
```
