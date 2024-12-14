"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface PopularRewardsProps {
  rewards: {
    id: number;
    title: string;
    category: string;
    points: number;
    exchangeCount: number;
  }[];
}

export function PopularRewards({ rewards }: PopularRewardsProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">順位</TableHead>
          <TableHead>タイトル</TableHead>
          <TableHead>カテゴリー</TableHead>
          <TableHead>ポイント</TableHead>
          <TableHead>交換回数</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rewards.map((reward, index) => (
          <TableRow key={reward.id}>
            <TableCell>
              {index < 3 ? (
                <Trophy className={`h-5 w-5 ${
                  index === 0 ? "text-yellow-500" :
                  index === 1 ? "text-gray-400" :
                  "text-amber-600"
                }`} />
              ) : (
                index + 1
              )}
            </TableCell>
            <TableCell className="font-medium">{reward.title}</TableCell>
            <TableCell>
              <Badge variant="outline">{reward.category}</Badge>
            </TableCell>
            <TableCell>{reward.points.toLocaleString()} pt</TableCell>
            <TableCell>{reward.exchangeCount.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}