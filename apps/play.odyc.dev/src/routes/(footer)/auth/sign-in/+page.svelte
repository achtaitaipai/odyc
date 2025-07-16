<script lang="ts">
	import IconGhost from '@lucide/svelte/icons/ghost';
	import IconGitHub from '@lucide/svelte/icons/github';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Backend } from '$lib/backend';
	import { invalidate } from '$app/navigation';
	import { Dependencies } from '$lib/constants';
	import { type Models } from 'appwrite';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { REGEXP_ONLY_DIGITS } from 'bits-ui';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import { toast } from 'svelte-sonner';
	import { stores } from '$lib/stores.svelte';

	let isLoading = $state(false);

	let email = $state('');
	let otp = $state('');
	let error = $state<any>(null);

	let token = $state<null | Models.Token>(null);
	let step = $state<1 | 2>(1);

	async function onMagicSignIn(event: Event) {
		event.preventDefault();
		isLoading = true;
		error = null;

		if (!token) {
			try {
				token = await Backend.signInMagicURL(email);
				step = 2;
				toast.success(stores.t('auth.emailSent'));
			} catch (err: any) {
				error = err;
			} finally {
				isLoading = false;
			}
		} else {
			try {
				await Backend.signInFinish(token?.userId ?? '', otp);
				await invalidate(Dependencies.USER);

				toast.success(stores.t('auth.signInSuccess'));
			} catch (err: any) {
				error = err;
			} finally {
				isLoading = false;
			}
		}
	}

	function onStepBack() {
		step = 1;
		email = '';
		otp = '';
		token = null;
		error = null;
	}

	async function onGuestSignIn() {
		isLoading = true;
		error = null;
		try {
			await Backend.signInAnonymous();
			await invalidate(Dependencies.USER);
			toast.success('Guest account created successfully.');
		} catch (err: any) {
			error = err;
		} finally {
			isLoading = false;
		}
	}

	async function onGitHubSignIn() {
		isLoading = true;
		Backend.signInGitHub(); // Redirects away
	}
</script>

<div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="w-full max-w-sm">
		<div class="flex flex-col gap-6">
			<form onsubmit={onMagicSignIn}>
				<div class="flex flex-col gap-6">
					<div class="flex flex-col items-center gap-2">
						<a href="/" class="flex flex-col items-center gap-2 font-medium">
							<div class="flex items-center justify-center rounded-md">
								<img src="/logo.png" class="pixelated size-12" alt="Odyc.js Play Logo" />
							</div>
						</a>
						<h1 class="text-xl font-bold">{stores.t('auth.welcome')}</h1>
						<div class="text-muted-foreground text-center text-sm">
							{stores.t('auth.welcomeDescription')}
						</div>
					</div>
					<Separator />

					{#if step === 1}
						<div class="flex flex-col gap-6">
							<div class="grid gap-3">
								<Label for="login-email">{stores.t('auth.email')}</Label>
								<Input
									bind:value={email}
									id="login-email"
									type="text"
									placeholder="your@email.com"
									required
								/>
							</div>
							<Button disabled={isLoading} type="submit" class="w-full">{stores.t('auth.signIn')}</Button>
						</div>
					{:else if step === 2}
						<div class="flex flex-col items-center gap-6">
							<div class="grid gap-3">
								<InputOTP.Root
									bind:value={otp}
									class="w-full"
									pattern={REGEXP_ONLY_DIGITS}
									maxlength={6}
								>
									{#snippet children({ cells })}
										<InputOTP.Group>
											{#each cells.slice(0, 3) as cell (cell)}
												<InputOTP.Slot {cell} />
											{/each}
										</InputOTP.Group>
										<InputOTP.Separator />
										<InputOTP.Group>
											{#each cells.slice(3, 6) as cell (cell)}
												<InputOTP.Slot {cell} />
											{/each}
										</InputOTP.Group>
									{/snippet}
								</InputOTP.Root>
							</div>
							<div class="flex w-full flex-col justify-center">
								<Button disabled={isLoading} type="submit" class="w-full">{stores.t('auth.continue')}</Button>
								<button onclick={onStepBack}
									><p class="text-muted-foreground mt-3 text-center text-sm underline">
										Didn't receive the code?
									</p></button
								>
							</div>
						</div>
					{/if}

					{#if error}
						<Alert.Root variant="destructive">
							<AlertCircleIcon />
							<Alert.Description class="text-destructive">{error.message}</Alert.Description>
						</Alert.Root>
					{/if}

					<div
						class="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
					>
						<span class="bg-background text-muted-foreground relative z-10 px-2"> {stores.t('auth.or')} </span>
					</div>
					<div class="grid gap-4 sm:grid-cols-2">
						<Button
							disabled={isLoading}
							onclick={onGuestSignIn}
							variant="outline"
							type="button"
							class="!disabled:opacity-50 w-full  border-dashed !bg-transparent"
						>
							<IconGhost />
							{stores.t('auth.anonymousContinue')}
						</Button>
						<Button
							disabled={isLoading}
							onclick={onGitHubSignIn}
							variant="outline"
							type="button"
							class="w-full "
						>
							<IconGitHub />
							Continue with GitHub
						</Button>
					</div>
				</div>
			</form>

			<!--
			TODO: Add legal documents, eventuelly
			<div
				class="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4"
			>
				By clicking continue, you agree to our <a href="##">Terms of Service</a>
				and <a href="##">Privacy Policy</a>.
			</div>
			-->
		</div>
	</div>
</div>
