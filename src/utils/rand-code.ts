// Tạo ngẫu nhiên một mã code toàn số có định dạng XXXXXX
function randCode(head: number = 1e5, tail: number = 1e6 - 1): number {
  return Math.floor(Math.random() * (tail - head + 1) + head);
}

export default randCode;
