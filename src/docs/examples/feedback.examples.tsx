import { useEffect, useState } from 'react';
import { Inbox, Plus, Upload } from 'lucide-react';
import {
  AnimatedNumber,
  Avatar,
  Badge,
  Banner,
  Button,
  EmptyState,
  HStack,
  ProgressBar,
  Skeleton,
  Spinner,
  StatusChip,
  StatusDot,
  Text,
  VStack,
} from '../../sfera';

// #region BadgeExample
export function BadgeExample() {
  return (
    <HStack gap={2} wrap justify="center">
      <Badge>Draft</Badge>
      <Badge tone="accent">New</Badge>
      <Badge tone="success">Paid</Badge>
      <Badge tone="warning">Due soon</Badge>
      <Badge tone="danger">Overdue</Badge>
      <Badge variant="solid">152</Badge>
      <Badge variant="outline" mono>v0.1.0</Badge>
    </HStack>
  );
}
// #endregion

// #region StatusChips
export function StatusChips() {
  return (
    <VStack gap={3} align="center">
      <HStack gap={2} wrap justify="center">
        <StatusChip tone="warning">Waiting</StatusChip>
        <StatusChip tone="danger">Delivery failed</StatusChip>
        <StatusChip tone="success">Shipped</StatusChip>
        <StatusChip tone="info">Processing</StatusChip>
        <StatusChip tone="neutral">Archived</StatusChip>
      </HStack>
      <HStack gap={2} wrap justify="center">
        <StatusChip variant="dot" tone="warning">Waiting</StatusChip>
        <StatusChip variant="dot" tone="success">Completed</StatusChip>
        <StatusChip variant="dot" tone="info">Processing</StatusChip>
        <StatusChip variant="dot" tone="danger" size="sm">Failed</StatusChip>
      </HStack>
    </VStack>
  );
}
// #endregion

// #region StatusDots
export function StatusDots() {
  return (
    <HStack gap={5} wrap justify="center">
      <HStack gap={2}><StatusDot tone="success" live /> <Text size="sm">Live</Text></HStack>
      <HStack gap={2}><StatusDot tone="warning" /> <Text size="sm">Degraded</Text></HStack>
      <HStack gap={2}><StatusDot tone="danger" /> <Text size="sm">Down</Text></HStack>
      <HStack gap={2}><StatusDot tone="neutral" /> <Text size="sm">Paused</Text></HStack>
    </HStack>
  );
}
// #endregion

// #region Banners
export function Banners() {
  const [show, setShow] = useState(true);
  return (
    <VStack gap={2}>
      <Banner tone="info" title="New: accent presets">Switch the accent from the Themes page.</Banner>
      <Banner tone="success" title="Payout sent">$12,480.00 lands on Thursday.</Banner>
      <Banner tone="warning" title="Card expires soon" action={<Button size="sm">Update</Button>} />
      {show ? (
        <Banner tone="danger" title="Webhook failing" onDismiss={() => setShow(false)}>
          3 deliveries to api.acme.com returned 500.
        </Banner>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setShow(true)}>Show dismissed banner</Button>
      )}
    </VStack>
  );
}
// #endregion

// #region Progress
export function Progress() {
  const [v, setV] = useState(32);
  return (
    <VStack gap={4}>
      <ProgressBar label="Storage" value={v} />
      <ProgressBar label="Quota" value={86} tone="warning" />
      <ProgressBar label="Errors" value={12} tone="danger" thick />
      <HStack gap={2}>
        <Button size="sm" onClick={() => setV((x) => Math.max(0, x - 10))}>−10</Button>
        <Button size="sm" onClick={() => setV((x) => Math.min(100, x + 10))}>+10</Button>
      </HStack>
    </VStack>
  );
}
// #endregion

// #region Loading
export function Loading() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, [loading]);
  return (
    <VStack gap={4}>
      <HStack gap={4} justify="center">
        <Spinner size="sm" />
        <Spinner />
        <Spinner size="lg" />
      </HStack>
      <HStack gap={3} align="start">
        {loading ? <Skeleton shape="circle" width={40} height={40} /> : <Avatar name="Mira Chen" size="lg" />}
        <VStack gap={2} grow>
          {loading ? (
            <>
              <Skeleton shape="text" width="40%" />
              <Skeleton shape="text" width="85%" />
              <Skeleton shape="text" width="70%" />
            </>
          ) : (
            <>
              <Text weight="medium">Mira Chen</Text>
              <Text size="sm" tone="muted">Moved “Linear” to Negotiation · 2m ago</Text>
            </>
          )}
        </VStack>
      </HStack>
      <Button size="sm" onClick={() => setLoading(true)}>Reload</Button>
    </VStack>
  );
}
// #endregion

// #region Empty
export function Empty() {
  return (
    <EmptyState
      icon={<Inbox size={18} />}
      title="No conversations yet"
      description="When customers reply to your emails or chat with you, the threads land here."
      actions={
        <>
          <Button variant="primary" iconStart={<Plus size={15} />}>New conversation</Button>
          <Button iconStart={<Upload size={15} />}>Import</Button>
        </>
      }
    />
  );
}
// #endregion

// #region NumberRoll
export function NumberRoll() {
  const [n, setN] = useState(31600);
  return (
    <VStack gap={3} align="center">
      <span style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.04em' }}>
        <AnimatedNumber value={n} />
      </span>
      <HStack gap={2}>
        <Button size="sm" onClick={() => setN((x) => x - 1250)}>−1,250</Button>
        <Button size="sm" variant="primary" onClick={() => setN((x) => x + 2475)}>+2,475</Button>
      </HStack>
    </VStack>
  );
}
// #endregion
