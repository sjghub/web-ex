import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { CreditCard, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PincodeFormProps {
  title: string;
  description: string;
  onBack: () => void;
  onComplete: (pincode: string) => void;
  onForgotPassword?: () => void;
  maxLength?: number;
  validateHasPincode?: boolean;
}

const PincodeForm = forwardRef<{ resetPassword: () => void }, PincodeFormProps>(
  (
    { title, description, onComplete, onForgotPassword, maxLength = 6 },
    ref,
  ) => {
    const [password, setPassword] = useState<string>("");
    const [shuffledKeys, setShuffledKeys] = useState<number[]>([]);

    useImperativeHandle(ref, () => ({
      resetPassword: () => {
        setPassword("");
        shuffleKeypad();
      },
    }));

    useEffect(() => {
      shuffleKeypad();
    }, []);

    const shuffleKeypad = () => {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      setShuffledKeys(numbers);
    };

    const handleKeyPress = (num: number) => {
      if (password.length < maxLength) {
        setPassword(password + num.toString());
      }
    };

    const handleDelete = () => {
      if (password.length > 0) {
        setPassword(password.slice(0, -1));
      }
    };

    return (
      <div className="w-full max-w-md">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="pt-6 pb-4">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-4">
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              <p className="text-gray-500 whitespace-pre-line">{description}</p>
            </div>

            <div className="flex justify-center space-x-4 mb-8">
              {Array.from({ length: maxLength }).map((_, index) => (
                <span
                  key={index}
                  className="text-2xl font-mono w-4 text-center"
                >
                  {index < password.length ? "•" : "_"}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {shuffledKeys.slice(0, 9).map((num) => (
                <button
                  key={num}
                  className="h-14 flex items-center justify-center text-xl font-medium active:bg-gray-100 cursor-pointer"
                  onClick={() => handleKeyPress(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className="h-14 flex items-center justify-center text-xl font-medium active:bg-gray-100 cursor-pointer"
                onClick={shuffleKeypad}
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                className="h-14 flex items-center justify-center text-xl font-medium active:bg-gray-100 cursor-pointer"
                onClick={() => handleKeyPress(shuffledKeys[9])}
              >
                {shuffledKeys[9]}
              </button>
              <button
                className="h-14 flex items-center justify-center text-xl font-medium active:bg-gray-100 cursor-pointer"
                onClick={handleDelete}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Button
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={password.length !== maxLength}
              onClick={() => onComplete(password)}
            >
              완료
            </Button>

            <p className="text-xs text-gray-400 text-center mt-4">
              * 생년월일, 전화번호 등 추측하기 쉬운 번호는 사용하지 마세요.
            </p>

            {onForgotPassword && (
              <Button
                onClick={onForgotPassword}
                className="w-full text-sm text-gray-500 hover:text-gray-700 mt-4 underline"
              >
                비밀번호를 잊어버리셨나요?
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  },
);

PincodeForm.displayName = "PincodeForm";

export default PincodeForm;
