CREATE TABLE `results` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`whatsapp` text NOT NULL,
	`technical_level` text NOT NULL,
	`goal_id` text NOT NULL,
	`route` text NOT NULL,
	`users` text NOT NULL,
	`workload` text NOT NULL,
	`priority` text NOT NULL,
	`product_family` text NOT NULL,
	`product_name` text NOT NULL,
	`confidence` integer DEFAULT 0 NOT NULL,
	`payload_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_results_created_at` ON `results` (`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_results_expires_at` ON `results` (`expires_at`);
