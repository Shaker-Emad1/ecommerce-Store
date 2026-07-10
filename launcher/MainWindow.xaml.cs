using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;

namespace ASBrandStoreLauncher
{
    public partial class MainWindow : Window
    {
        private const string DefaultBackendUrl = "http://localhost:5262";
        private const string DefaultFrontendUrl = "http://localhost:5173";

        private Process? _backendProcess;
        private Process? _frontendProcess;
        private readonly string _backendUrl;
        private readonly string _frontendUrl;
        private string _projectRoot = "";

        public MainWindow()
        {
            InitializeComponent();

            _projectRoot = FindProjectRoot();
            _backendUrl = GetConfiguredUrl("ASBRANDSTORE_BACKEND_URL", DefaultBackendUrl);
            _frontendUrl = GetConfiguredUrl("ASBRANDSTORE_FRONTEND_URL", DefaultFrontendUrl);

            BackendUrlText.Text = _backendUrl;
            FrontendUrlText.Text = _frontendUrl;
            StatusInfoText.Content = $"Project path: {_projectRoot}";
        }

        private static string GetConfiguredUrl(string variableName, string fallback)
        {
            var configured = Environment.GetEnvironmentVariable(variableName);
            return string.IsNullOrWhiteSpace(configured) ? fallback : configured.Trim();
        }

        private string FindProjectRoot()
        {
            string? currentDir = AppDomain.CurrentDomain.BaseDirectory;
            while (!string.IsNullOrEmpty(currentDir))
            {
                if (Directory.Exists(Path.Combine(currentDir, "backend")) &&
                    (Directory.Exists(Path.Combine(currentDir, "Frontend")) ||
                     Directory.Exists(Path.Combine(currentDir, "Premium Arabic E-commerce UI_UX"))))
                {
                    return currentDir;
                }

                currentDir = Path.GetDirectoryName(currentDir);
            }

            return AppDomain.CurrentDomain.BaseDirectory;
        }

        private void StartBtn_Click(object sender, RoutedEventArgs e)
        {
            StartBtn.IsEnabled = false;
            StopBtn.IsEnabled = true;

            BackendLogBox.Clear();
            FrontendLogBox.Clear();

            SetStatus(BackendStatusIndicator, BackendStatusText, "Starting...", "#FF9500");
            SetStatus(FrontendStatusIndicator, FrontendStatusText, "Starting...", "#FF9500");
            StatusInfoText.Content = "Starting services...";

            Task.Run(StartBackend);
            Task.Run(StartFrontend);
        }

        private void StartBackend()
        {
            try
            {
                string backendDir = Path.Combine(_projectRoot, "backend", "ASBrandStore.Api");

                AppendLog(BackendLogBox, "[System] Starting Backend API..." + Environment.NewLine);

                var psi = new ProcessStartInfo
                {
                    FileName = "dotnet",
                    Arguments = "run",
                    WorkingDirectory = backendDir,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                _backendProcess = new Process { StartInfo = psi };
                _backendProcess.OutputDataReceived += (_, args) =>
                {
                    if (args.Data != null)
                    {
                        AppendLog(BackendLogBox, args.Data + Environment.NewLine);
                    }
                };
                _backendProcess.ErrorDataReceived += (_, args) =>
                {
                    if (args.Data != null)
                    {
                        AppendLog(BackendLogBox, "[ERROR] " + args.Data + Environment.NewLine);
                    }
                };

                _backendProcess.Start();
                _backendProcess.BeginOutputReadLine();
                _backendProcess.BeginErrorReadLine();

                Dispatcher.Invoke(() =>
                {
                    SetStatus(BackendStatusIndicator, BackendStatusText, "Running", "#34C759");
                    StatusInfoText.Content = "Backend started successfully.";
                });

                _backendProcess.WaitForExit();
            }
            catch (Exception ex)
            {
                Dispatcher.Invoke(() =>
                {
                    SetStatus(BackendStatusIndicator, BackendStatusText, "Startup error", "#FF3B30");
                    AppendLog(BackendLogBox, $"[ERROR] Failed to start backend: {ex.Message}{Environment.NewLine}");
                });
            }
        }

        private void StartFrontend()
        {
            try
            {
                string frontendDir = ResolveFrontendDirectory();

                AppendLog(FrontendLogBox, "[System] Starting Frontend UI..." + Environment.NewLine);

                var psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c npm run dev",
                    WorkingDirectory = frontendDir,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                _frontendProcess = new Process { StartInfo = psi };
                _frontendProcess.OutputDataReceived += (_, args) =>
                {
                    if (args.Data != null)
                    {
                        AppendLog(FrontendLogBox, args.Data + Environment.NewLine);
                    }
                };
                _frontendProcess.ErrorDataReceived += (_, args) =>
                {
                    if (args.Data != null)
                    {
                        AppendLog(FrontendLogBox, "[ERROR] " + args.Data + Environment.NewLine);
                    }
                };

                _frontendProcess.Start();
                _frontendProcess.BeginOutputReadLine();
                _frontendProcess.BeginErrorReadLine();

                Dispatcher.Invoke(() =>
                {
                    SetStatus(FrontendStatusIndicator, FrontendStatusText, "Running", "#34C759");
                    StatusInfoText.Content = "Frontend started successfully.";
                });

                _frontendProcess.WaitForExit();
            }
            catch (Exception ex)
            {
                Dispatcher.Invoke(() =>
                {
                    SetStatus(FrontendStatusIndicator, FrontendStatusText, "Startup error", "#FF3B30");
                    AppendLog(FrontendLogBox, $"[ERROR] Failed to start frontend: {ex.Message}{Environment.NewLine}");
                });
            }
        }

        private string ResolveFrontendDirectory()
        {
            string currentFrontendDir = Path.Combine(_projectRoot, "Frontend");
            if (Directory.Exists(currentFrontendDir))
            {
                return currentFrontendDir;
            }

            return Path.Combine(_projectRoot, "Premium Arabic E-commerce UI_UX");
        }

        private void StopBtn_Click(object sender, RoutedEventArgs e)
        {
            StopProcesses();
        }

        private void StopProcesses()
        {
            StatusInfoText.Content = "Stopping services...";

            try
            {
                if (_backendProcess != null && !_backendProcess.HasExited)
                {
                    AppendLog(BackendLogBox, "[System] Stopping backend process..." + Environment.NewLine);
                    _backendProcess.Kill(true);
                }
            }
            catch (Exception ex)
            {
                AppendLog(BackendLogBox, $"[System] Error while stopping backend: {ex.Message}{Environment.NewLine}");
            }
            finally
            {
                SetStatus(BackendStatusIndicator, BackendStatusText, "Stopped", "#FF3B30");
            }

            try
            {
                if (_frontendProcess != null && !_frontendProcess.HasExited)
                {
                    AppendLog(FrontendLogBox, "[System] Stopping frontend process..." + Environment.NewLine);
                    _frontendProcess.Kill(true);
                }
            }
            catch (Exception ex)
            {
                AppendLog(FrontendLogBox, $"[System] Error while stopping frontend: {ex.Message}{Environment.NewLine}");
            }
            finally
            {
                SetStatus(FrontendStatusIndicator, FrontendStatusText, "Stopped", "#FF3B30");
            }

            StartBtn.IsEnabled = true;
            StopBtn.IsEnabled = false;
            StatusInfoText.Content = "All services stopped.";
        }

        private void AppendLog(System.Windows.Controls.TextBox logBox, string text)
        {
            Dispatcher.InvokeAsync(() =>
            {
                logBox.AppendText(text);
                logBox.ScrollToEnd();
            });
        }

        private void SetStatus(System.Windows.Shapes.Ellipse indicator, System.Windows.Controls.TextBlock textBlock, string statusText, string colorHex)
        {
            var brush = (Brush)new BrushConverter().ConvertFromString(colorHex)!;
            indicator.Fill = brush;
            textBlock.Foreground = brush;
            textBlock.Text = statusText;
        }

        private void OpenSwagger_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = $"{_backendUrl.TrimEnd('/')}/swagger",
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to open the URL: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void OpenFrontend_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = _frontendUrl,
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to open the URL: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            StopProcesses();
        }
    }
}
