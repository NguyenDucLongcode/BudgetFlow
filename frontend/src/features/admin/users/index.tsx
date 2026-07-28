import Header from "./header";
import { UserStats } from "./UserStats";

export default function UserPageComponent() {
  return (
    <div>
      <Header />
      <UserStats
        counts={{ total: 100, active: 80, suspended: 10, admins: 5 }}
      />
    </div>
  );
}
