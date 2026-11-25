export function translateNotification(
  title: string = "",
  message: string = "",
  locale: string = "vi",
): { title: string; message: string } {
  if (locale !== "en") {
    return { title, message };
  }

  // Dictionary for Titles
  const titleMap: Record<string, string> = {
    "Mục tiêu hoàn thành": "Goal Completed",
    "Hoàn thành mục tiêu": "Goal Completed",
    "Cảnh báo ngân sách": "Budget Alert",
    "Cảnh báo chi tiêu": "Spending Alert",
    "Thanh toán nợ": "Debt Payment",
    "Thanh toán nợ thành công": "Debt Payment Successful",
    "Giao dịch đã thực hiện": "Transaction Executed",
    "Giao dịch dự kiến": "Scheduled Transaction",
    "Giao dịch thành công": "Transaction Successful",
    "Nhắc nhở nợ": "Debt Reminder",
    "Nhắc nhở đến hạn": "Due Date Reminder",
    "Thông báo hệ thống": "System Notification",
    "Thông báo mới": "New Notification",
  };

  let translatedTitle = title;
  for (const [viKey, enVal] of Object.entries(titleMap)) {
    if (translatedTitle.includes(viKey)) {
      translatedTitle = translatedTitle.replace(viKey, enVal);
    }
  }

  // Dictionary for Message replacements
  const phraseMap: [RegExp, string][] = [
    [/Chúc mừng! Bạn đã hoàn thành 100% mục tiêu/gi, "Congratulations! You reached 100% of goal"],
    [/Chúc mừng! Bạn đã hoàn thành mục tiêu/gi, "Congratulations! You reached your goal"],
    [/Tuyệt vời! Bạn đã hoàn thành/gi, "Awesome! You completed"],
    [/Chúc mừng! Bạn đã hoàn tất trả nợ khoản/gi, "Congratulations! You have fully repaid"],
    [/Tuyệt vời! Bạn đã thu hồi xong toàn bộ khoản cho vay/gi, "Awesome! You have fully collected loan"],
    [/Giao dịch dự kiến/gi, "Scheduled transaction"],
    [/đã được thực hiện\. Số dư ví đã được cập nhật!/gi, "has been executed. Wallet balance updated!"],
    [/đã được thực hiện/gi, "has been executed"],
    [/Số dư ví đã được cập nhật/gi, "Wallet balance has been updated"],
    [/đã vượt ngưỡng chi tiêu/gi, "has exceeded spending threshold"],
    [/sắp chạm ngưỡng ngân sách/gi, "is reaching budget limit"],
    [/ngân sách danh mục/gi, "category budget"],
    [/đã sử dụng/gi, "has used"],
    [/tổng ngân sách/gi, "total budget"],
    [/khoản nợ/gi, "debt"],
    [/khoản cho vay/gi, "loan"],
    [/đã đến hạn thanh toán/gi, "is due for payment"],
    [/Ghi nhận thanh toán/gi, "Recorded payment of"],
    [/thành công/gi, "successfully"],
  ];

  let translatedMessage = message;
  for (const [regex, replacement] of phraseMap) {
    translatedMessage = translatedMessage.replace(regex, replacement);
  }

  return {
    title: translatedTitle,
    message: translatedMessage,
  };
}
