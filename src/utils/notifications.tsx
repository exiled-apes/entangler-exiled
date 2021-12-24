import React from "react";
import { notification } from "antd";
import { Link } from "@mui/material";

export function notify({
  message = "",
  description = undefined as any,
  txid = "",
  type = "info",
  placement = "bottomLeft",
}) {
  if (txid) {
    <Link
      target="_blank"
      rel="noreferrer noopener"
      href={"https://explorer.solana.com/tx/" + txid}
      style={{ color: "#0000ff" }}
    >
      View transaction {txid.slice(0, 8)}...{txid.slice(txid.length - 8)}
    </Link>;
  }
  (notification as any)[type]({
    message: <span style={{ color: "black" }}>{message}</span>,
    description: (
      <span style={{ color: "black", opacity: 0.5 }}>{description}</span>
    ),
    placement,
    style: {
      backgroundColor: "white",
    },
  });
}
